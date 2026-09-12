import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { compileScript, parse } from "@vue/compiler-sfc";
import ts from "typescript";

const root = resolve(import.meta.dirname, "..");
const outputPath = resolve(root, "layer/authoring.generated.ts");
const components = {
  MdcColumn: "MdcColumn.vue",
  MdcInfo: "MdcInfo.vue",
  MdcLayout: "MdcLayout.vue",
};
const componentSources = [];

function propertyName(node) {
  return ts.isIdentifier(node) || ts.isStringLiteral(node) ? node.text : undefined;
}

function findPropsObject(sourceFile) {
  let result;
  function visit(node) {
    if (
      ts.isPropertyAssignment(node) &&
      propertyName(node.name) === "props" &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      result = node.initializer;
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  if (!result) throw new Error("Vue compiler output did not contain runtime props.");
  return result;
}

function runtimeType(node) {
  if (node.kind === ts.SyntaxKind.NullKeyword) return "complex";
  if (!ts.isIdentifier(node)) throw new Error(`Unsupported runtime prop: ${node.getText()}`);
  const type = { Boolean: "boolean", Number: "number", Object: "object", String: "string" }[
    node.text
  ];
  if (!type) throw new Error(`Unsupported Vue runtime prop type: ${node.text}`);
  return type;
}

export function literal(node) {
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  throw new Error(`Unsupported generated default: ${node.getText()}`);
}

function collectTypeAliases(sourceFile) {
  return new Map(
    sourceFile.statements.flatMap((statement) =>
      ts.isTypeAliasDeclaration(statement)
        ? [
            [
              statement.name.text,
              {
                parameters: statement.typeParameters?.map(({ name }) => name.text) ?? [],
                type: statement.type,
              },
            ],
          ]
        : [],
    ),
  );
}

function stringOptions(node, aliases, bindings = new Map(), seenNames = new Set()) {
  if (ts.isParenthesizedTypeNode(node)) {
    return stringOptions(node.type, aliases, bindings, seenNames);
  }
  if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) {
    return { complete: true, hasPrimitive: true, values: [node.literal.text] };
  }
  if (node.kind === ts.SyntaxKind.StringKeyword) {
    return { complete: false, hasPrimitive: true, values: [] };
  }
  if (ts.isUnionTypeNode(node)) {
    const branches = node.types.map((type) => stringOptions(type, aliases, bindings, seenNames));
    const primitiveBranches = branches.filter(({ hasPrimitive }) => hasPrimitive);
    return {
      complete: primitiveBranches.length > 0 && primitiveBranches.every(({ complete }) => complete),
      hasPrimitive: primitiveBranches.length > 0,
      values: primitiveBranches.flatMap(({ values }) => values),
    };
  }
  if (!ts.isTypeReferenceNode(node) || !ts.isIdentifier(node.typeName)) {
    return { complete: false, hasPrimitive: false, values: [] };
  }
  const name = node.typeName.text;
  const bound = bindings.get(name);
  if (bound) return stringOptions(bound, aliases, bindings, seenNames);
  if (seenNames.has(name)) return { complete: false, hasPrimitive: false, values: [] };
  const alias = aliases.get(name);
  if (!alias) return { complete: false, hasPrimitive: false, values: [] };
  if (alias.parameters.length !== (node.typeArguments?.length ?? 0)) {
    return { complete: false, hasPrimitive: false, values: [] };
  }
  const nextBindings = new Map(bindings);
  alias.parameters.forEach((parameter, index) =>
    nextBindings.set(parameter, node.typeArguments[index]),
  );
  return stringOptions(alias.type, aliases, nextBindings, new Set([...seenNames, name]));
}

export function sourcePropOptions(script) {
  const sourceFile = ts.createSourceFile(
    "component.ts",
    script,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const aliases = collectTypeAliases(sourceFile);
  const options = {};
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "defineProps" &&
      node.typeArguments?.length === 1 &&
      ts.isTypeLiteralNode(node.typeArguments[0])
    ) {
      for (const member of node.typeArguments[0].members) {
        if (!ts.isPropertySignature(member) || !member.type) continue;
        const name = propertyName(member.name);
        if (!name) continue;
        const result = stringOptions(member.type, aliases);
        const values = [...new Set(result.values)];
        if (result.hasPrimitive && result.complete && values.length > 0) options[name] = values;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return options;
}

export function sourceSlots(templateAst) {
  const slots = [];
  function visit(node) {
    if (node.type === 1 && node.tag === "slot") {
      const nameAttribute = node.props.find(
        (prop) => prop.type === 6 && prop.name === "name" && prop.value,
      );
      const hasDynamicName = node.props.some(
        (prop) => prop.type === 7 && prop.name === "bind" && prop.arg?.content === "name",
      );
      const name = nameAttribute?.value.content ?? (hasDynamicName ? undefined : "default");
      if (name && !slots.includes(name)) slots.push(name);
    }
    for (const child of node.children ?? []) visit(child);
  }
  visit(templateAst);
  return slots;
}

function extractComponent(componentName, file) {
  const path = resolve(root, "layer/app/components/mdc", file);
  const source = readFileSync(path, "utf8");
  componentSources.push(source);
  const { descriptor, errors } = parse(source, { filename: file });
  if (errors.length > 0) throw errors[0];
  if (!descriptor.scriptSetup || !descriptor.template) {
    throw new Error(`${componentName} must have script setup and a template.`);
  }
  const options = sourcePropOptions(descriptor.scriptSetup.content);
  const slots = sourceSlots(descriptor.template.ast);
  const compiled = compileScript(descriptor, { id: componentName }).content;
  const sourceFile = ts.createSourceFile(
    file,
    compiled,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const props = {};

  for (const property of findPropsObject(sourceFile).properties) {
    if (!ts.isPropertyAssignment(property) || !ts.isObjectLiteralExpression(property.initializer))
      continue;
    const name = propertyName(property.name);
    if (!name) throw new Error(`Unsupported prop name in ${file}.`);
    const fields = new Map(
      property.initializer.properties.flatMap((field) =>
        ts.isPropertyAssignment(field) && propertyName(field.name)
          ? [[propertyName(field.name), field.initializer]]
          : [],
      ),
    );
    const typeNode = fields.get("type");
    const requiredNode = fields.get("required");
    if (!typeNode || !requiredNode)
      throw new Error(`Incomplete metadata for ${componentName}.${name}.`);
    const types = ts.isArrayLiteralExpression(typeNode)
      ? typeNode.elements.map(runtimeType)
      : [runtimeType(typeNode)];
    const metadata = { required: requiredNode.kind === ts.SyntaxKind.TrueKeyword, types };
    const defaultNode = fields.get("default");
    if (defaultNode) metadata.default = literal(defaultNode);
    const propOptions = options[name];
    if (propOptions) {
      if (!types.includes("string"))
        throw new Error(`${componentName}.${name} options require string support.`);
      metadata.options = propOptions;
    }
    props[name] = metadata;
  }
  return { componentName, props, slots };
}

function jsonValue(node) {
  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(
      node.properties.map((property) => {
        if (!ts.isPropertyAssignment(property))
          throw new Error("Generated payload is not plain data.");
        const name = propertyName(property.name);
        if (!name) throw new Error("Generated payload has an unsupported key.");
        return [name, jsonValue(property.initializer)];
      }),
    );
  }
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(jsonValue);
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  throw new Error(`Generated payload contains unsupported syntax: ${node.getText()}`);
}

function generatedPayload(source) {
  const sourceFile = ts.createSourceFile(
    outputPath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const declaration = statement.declarationList.declarations[0];
    if (
      declaration &&
      ts.isIdentifier(declaration.name) &&
      declaration.name.text === "componentImplementationByName" &&
      declaration.initializer
    ) {
      const initializer = ts.isAsExpression(declaration.initializer)
        ? declaration.initializer.expression
        : declaration.initializer;
      return jsonValue(initializer);
    }
  }
  throw new Error("Generated implementation payload is missing.");
}

function main() {
  const metadata = Object.fromEntries(
    Object.entries(components).map(([name, file]) => [name, extractComponent(name, file)]),
  );
  const sourceHash = createHash("sha256")
    .update(JSON.stringify(components))
    .update(componentSources.join("\0"))
    .digest("hex");
  const output =
    `// Generated by scripts/generate-authoring-metadata.mjs. Do not edit.\n` +
    `export const componentImplementationSourceHash = "${sourceHash}";\n` +
    `export const componentImplementationByName = ${JSON.stringify(metadata, null, 2)} as const;\n`;

  if (process.argv.includes("--check")) {
    const current = readFileSync(outputPath, "utf8");
    const currentHash = current.match(
      /componentImplementationSourceHash\s*=\s*"([a-f0-9]{64})"/,
    )?.[1];
    if (
      currentHash !== sourceHash ||
      JSON.stringify(generatedPayload(current)) !== JSON.stringify(metadata)
    ) {
      throw new Error("layer/authoring.generated.ts is stale. Run pnpm build:authoring.");
    }
  } else {
    writeFileSync(outputPath, output);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();

<script setup lang="ts">
import { reactive, ref } from "vue";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n, useRoute } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { useCookieConsent } from "@/composables/useCookieConsent";
import { useTracking } from "@/composables/useTracking";
import {
  leadMagnetFormToLeadPayload,
  submitLeadForm,
  validateLeadMagnetForm,
  type LeadMagnetFormErrors,
  type LeadMagnetFormInput,
} from "@/lib/forms";

const props = withDefaults(
  defineProps<{
    resourceId: string;
    formKey?: string;
  }>(),
  {
    formKey: "leadMagnet",
  },
);

const { locale, t } = useI18n();
const localizedPath = useLocalizedPath();
const route = useRoute();
const { track, trackDownload, trackForm } = useTracking();
const { version } = useCookieConsent();

const form = reactive<LeadMagnetFormInput>({
  company: "",
  email: "",
  name: "",
  privacyAccepted: false,
  resourceId: props.resourceId,
  website: "",
});
const errors = ref<LeadMagnetFormErrors>({});
const submitting = ref(false);
const submitError = ref(false);
const submitted = ref(false);
const started = ref(false);

function fieldError(key: keyof LeadMagnetFormErrors) {
  const error = errors.value[key];
  return error ? t(`forms.leadMagnet.errors.${error}`) : undefined;
}

function fieldDescribedBy(key: keyof LeadMagnetFormErrors) {
  return fieldError(key) ? `lead-magnet-${key}-error` : undefined;
}

function markStarted() {
  if (started.value) return;
  started.value = true;
  trackForm("form_start", props.formKey);
}

async function submit() {
  markStarted();
  submitError.value = false;
  errors.value = validateLeadMagnetForm(form);

  if (Object.keys(errors.value).length > 0) return;

  submitting.value = true;

  try {
    const result = await submitLeadForm(props.formKey, leadMagnetFormToLeadPayload(form), {
      consentVersion: version.value,
      locale: locale.value,
      sourcePath: route.path,
      track,
    });

    if (!result.ok) {
      submitError.value = true;
      return;
    }

    submitted.value = true;
    trackDownload(props.resourceId, t("forms.leadMagnet.downloadLabel"));
  } catch {
    submitError.value = true;
    trackForm("form_submit_error", props.formKey);
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form class="space-y-5" novalidate @focusin="markStarted" @submit.prevent="submit">
    <div class="hidden" aria-hidden="true">
      <label for="lead-magnet-website">Website</label>
      <input id="lead-magnet-website" v-model="form.website" name="website" tabindex="-1" />
    </div>

    <Alert v-if="submitted">
      <AlertTitle>{{ t("forms.leadMagnet.successTitle") }}</AlertTitle>
      <AlertDescription>{{ t("forms.leadMagnet.successDescription") }}</AlertDescription>
    </Alert>

    <Alert v-if="submitError" variant="destructive">
      <AlertTitle>{{ t("forms.leadMagnet.submitErrorTitle") }}</AlertTitle>
      <AlertDescription>{{ t("forms.leadMagnet.submitErrorDescription") }}</AlertDescription>
    </Alert>

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-2">
        <Label for="lead-magnet-name">
          {{ t("forms.leadMagnet.fields.name") }}
        </Label>
        <Input
          id="lead-magnet-name"
          v-model="form.name"
          autocomplete="name"
          name="name"
          type="text"
        />
      </div>

      <div class="space-y-2">
        <Label for="lead-magnet-email">
          {{ t("forms.leadMagnet.fields.email") }}
        </Label>
        <Input
          id="lead-magnet-email"
          v-model="form.email"
          :aria-describedby="fieldDescribedBy('email')"
          :aria-invalid="Boolean(errors.email)"
          autocomplete="email"
          name="email"
          type="email"
        />
        <p v-if="fieldError('email')" id="lead-magnet-email-error" class="text-sm text-destructive">
          {{ fieldError("email") }}
        </p>
      </div>
    </div>

    <div class="space-y-2">
      <Label for="lead-magnet-company">
        {{ t("forms.leadMagnet.fields.company") }}
      </Label>
      <Input
        id="lead-magnet-company"
        v-model="form.company"
        autocomplete="organization"
        name="company"
        type="text"
      />
    </div>

    <div class="space-y-2">
      <label class="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
        <input
          v-model="form.privacyAccepted"
          :aria-describedby="fieldDescribedBy('privacyAccepted')"
          :aria-invalid="Boolean(errors.privacyAccepted)"
          class="mt-1 size-4 rounded border border-input accent-primary"
          name="privacyAccepted"
          type="checkbox"
        />
        <span>
          {{ t("forms.leadMagnet.privacyPrefix") }}
          <NuxtLink
            class="text-primary underline-offset-4 hover:underline"
            :to="localizedPath('privacy')"
          >
            {{ t("forms.leadMagnet.privacyLink") }}
          </NuxtLink>
          {{ t("forms.leadMagnet.privacySuffix") }}
        </span>
      </label>
      <p
        v-if="fieldError('privacyAccepted')"
        id="lead-magnet-privacyAccepted-error"
        class="text-sm text-destructive"
      >
        {{ fieldError("privacyAccepted") }}
      </p>
    </div>

    <Button class="w-full sm:w-auto" type="submit" :disabled="submitting || submitted">
      <Icon
        :name="submitting ? 'lucide:loader-circle' : 'lucide:download'"
        class="size-4"
        :class="{ 'animate-spin': submitting }"
        aria-hidden="true"
      />
      {{ submitting ? t("forms.leadMagnet.sending") : t("forms.leadMagnet.submit") }}
    </Button>
  </form>
</template>

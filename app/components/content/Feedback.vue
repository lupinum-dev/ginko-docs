<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { nextTick, ref } from "vue";
import { useI18n } from "#imports";

withDefaults(
  defineProps<{
    label?: string;
  }>(),
  {
    label: undefined,
  },
);
const { t } = useI18n();

type Sentiment = "positive" | "negative";

const sentiment = ref<Sentiment | null>(null);
const message = ref("");
const wantsReply = ref(false);
const email = ref("");
const submitted = ref(false);
const sending = ref(false);
const textareaRef = ref<InstanceType<typeof Textarea> | null>(null);

function selectSentiment(s: Sentiment) {
  if (sentiment.value === s) {
    sentiment.value = null;
    return;
  }
  sentiment.value = s;
  nextTick(() => textareaRef.value?.focus());
}

async function submit(e: Event) {
  e.preventDefault();
  sending.value = true;
  await new Promise((r) => setTimeout(r, 500));
  sending.value = false;
  submitted.value = true;
}
</script>

<template>
  <div class="mt-14 border-y border-border py-5">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
    >
      <p v-if="submitted" class="py-1 text-sm text-muted-foreground">
        {{ t("feedback.thanks") }}
      </p>
    </Transition>

    <template v-if="!submitted">
      <div class="flex flex-wrap items-center gap-3">
        <p class="text-sm font-semibold text-foreground">{{ label ?? t("feedback.label") }}</p>

        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            class="h-9 w-20 rounded-full px-4 shadow-sm"
            :class="[
              sentiment === 'positive'
                ? 'border-success bg-success text-success-foreground'
                : 'text-muted-foreground',
            ]"
            @click="selectSentiment('positive')"
          >
            <Icon
              name="lucide:thumbs-up"
              class="shrink-0"
              :class="sentiment === 'positive' ? 'fill-current' : ''"
              aria-hidden="true"
            />
            {{ t("feedback.yes") }}
          </Button>

          <Button
            variant="outline"
            size="sm"
            class="h-9 w-20 rounded-full px-4 shadow-sm"
            :class="[
              sentiment === 'negative'
                ? 'border-destructive bg-destructive text-destructive-foreground'
                : 'text-muted-foreground',
            ]"
            @click="selectSentiment('negative')"
          >
            <Icon
              name="lucide:thumbs-down"
              class="shrink-0"
              :class="sentiment === 'negative' ? 'fill-current' : ''"
              aria-hidden="true"
            />
            {{ t("feedback.no") }}
          </Button>
        </div>
      </div>

      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <form v-if="sentiment !== null" class="mt-3 flex flex-col gap-3" @submit="submit">
          <Textarea
            ref="textareaRef"
            v-model="message"
            required
            :placeholder="t('feedback.placeholder')"
            rows="3"
            class="min-h-24 resize-none bg-secondary text-secondary-foreground"
          />
          <div class="space-y-3">
            <label
              for="feedback-wants-reply"
              class="flex items-start gap-3 text-sm text-muted-foreground"
            >
              <Checkbox
                id="feedback-wants-reply"
                :model-value="wantsReply"
                class="mt-0.5"
                @update:model-value="wantsReply = $event === true"
              />
              <span class="leading-5">{{ t("feedback.wantsReply") }}</span>
            </label>

            <div v-if="wantsReply" class="max-w-sm space-y-2">
              <label for="feedback-email" class="text-sm font-medium text-foreground">
                {{ t("feedback.emailLabel") }}
              </label>
              <Input
                id="feedback-email"
                v-model="email"
                autocomplete="email"
                name="email"
                :required="wantsReply"
                type="email"
                :placeholder="t('feedback.emailPlaceholder')"
              />
              <p class="text-xs leading-5 text-muted-foreground">
                {{ t("feedback.emailHint") }}
              </p>
            </div>
          </div>
          <Button type="submit" :disabled="sending" variant="outline" size="sm" class="w-fit">
            {{ sending ? t("feedback.sending") : t("feedback.submit") }}
          </Button>
        </form>
      </Transition>
    </template>
  </div>
</template>

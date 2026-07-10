<script setup lang="ts">
import { reactive, ref } from "vue";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { navigateTo, useI18n, useRoute } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { useCookieConsent } from "@/composables/useCookieConsent";
import { useTracking } from "@/composables/useTracking";
import {
  contactFormToLeadPayload,
  submitLeadForm,
  validateContactForm,
  type ContactFormErrors,
  type ContactFormInput,
} from "@/lib/forms";

const props = withDefaults(
  defineProps<{
    offerKey?: string;
    submitLabel?: string;
  }>(),
  {
    offerKey: undefined,
    submitLabel: undefined,
  },
);
const emit = defineEmits<{ submitted: [] }>();

const { locale, t } = useI18n();
const localizedPath = useLocalizedPath();
const route = useRoute();
const { track, trackForm } = useTracking();
const { version } = useCookieConsent();

const form = reactive<ContactFormInput>({
  company: "",
  email: "",
  message: "",
  name: "",
  phone: "",
  privacyAccepted: false,
  website: "",
});
const errors = ref<ContactFormErrors>({});
const submitting = ref(false);
const submitError = ref(false);
const started = ref(false);

function fieldError(key: keyof ContactFormErrors) {
  const error = errors.value[key];
  return error ? t(`forms.contact.errors.${error}`) : undefined;
}

function fieldDescribedBy(key: keyof ContactFormErrors) {
  return fieldError(key) ? `contact-${key}-error` : undefined;
}

function markStarted() {
  if (started.value) return;
  started.value = true;
  trackForm("form_start", "contact");
}

async function submit() {
  markStarted();
  submitError.value = false;
  errors.value = validateContactForm(form);

  if (Object.keys(errors.value).length > 0) {
    return;
  }

  submitting.value = true;

  try {
    const payload = contactFormToLeadPayload(form);
    if (props.offerKey) payload.offer_key = props.offerKey;
    const result = await submitLeadForm("contact", payload, {
      consentVersion: version.value,
      locale: locale.value,
      sourcePath: route.path,
      track,
    });

    if (!result.ok) {
      submitError.value = true;
      return;
    }

    emit("submitted");
    await navigateTo(localizedPath("thank-you"));
  } catch {
    submitError.value = true;
    trackForm("form_submit_error", "contact");
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form class="space-y-5" novalidate @focusin="markStarted" @submit.prevent="submit">
    <div class="hidden" aria-hidden="true">
      <label for="contact-website">Website</label>
      <input id="contact-website" v-model="form.website" name="website" tabindex="-1" />
    </div>

    <Alert v-if="submitError" variant="destructive">
      <AlertTitle>{{ t("forms.contact.submitErrorTitle") }}</AlertTitle>
      <AlertDescription>{{ t("forms.contact.submitErrorDescription") }}</AlertDescription>
    </Alert>

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-2">
        <Label for="contact-name">
          {{ t("forms.contact.fields.name") }}
        </Label>
        <Input
          id="contact-name"
          v-model="form.name"
          :aria-describedby="fieldDescribedBy('name')"
          :aria-invalid="Boolean(errors.name)"
          autocomplete="name"
          name="name"
          type="text"
        />
        <p v-if="fieldError('name')" id="contact-name-error" class="text-sm text-destructive">
          {{ fieldError("name") }}
        </p>
      </div>

      <div class="space-y-2">
        <Label for="contact-email">
          {{ t("forms.contact.fields.email") }}
        </Label>
        <Input
          id="contact-email"
          v-model="form.email"
          :aria-describedby="fieldDescribedBy('email')"
          :aria-invalid="Boolean(errors.email)"
          autocomplete="email"
          name="email"
          type="email"
        />
        <p v-if="fieldError('email')" id="contact-email-error" class="text-sm text-destructive">
          {{ fieldError("email") }}
        </p>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-2">
        <Label for="contact-company">
          {{ t("forms.contact.fields.company") }}
        </Label>
        <Input
          id="contact-company"
          v-model="form.company"
          :aria-describedby="fieldDescribedBy('company')"
          :aria-invalid="Boolean(errors.company)"
          autocomplete="organization"
          name="company"
          type="text"
        />
        <p v-if="fieldError('company')" id="contact-company-error" class="text-sm text-destructive">
          {{ fieldError("company") }}
        </p>
      </div>

      <div class="space-y-2">
        <Label for="contact-phone">
          {{ t("forms.contact.fields.phone") }}
        </Label>
        <Input
          id="contact-phone"
          v-model="form.phone"
          :aria-describedby="fieldDescribedBy('phone')"
          :aria-invalid="Boolean(errors.phone)"
          autocomplete="tel"
          name="phone"
          type="tel"
        />
        <p v-if="fieldError('phone')" id="contact-phone-error" class="text-sm text-destructive">
          {{ fieldError("phone") }}
        </p>
      </div>
    </div>

    <div class="space-y-2">
      <Label for="contact-message">
        {{ t("forms.contact.fields.message") }}
      </Label>
      <Textarea id="contact-message" v-model="form.message" name="message" />
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
          {{ t("forms.contact.privacyPrefix") }}
          <NuxtLink
            class="text-primary underline-offset-4 hover:underline"
            :to="localizedPath('privacy')"
          >
            {{ t("forms.contact.privacyLink") }}
          </NuxtLink>
          {{ t("forms.contact.privacySuffix") }}
        </span>
      </label>
      <p
        v-if="fieldError('privacyAccepted')"
        id="contact-privacyAccepted-error"
        class="text-sm text-destructive"
      >
        {{ fieldError("privacyAccepted") }}
      </p>
    </div>

    <Button class="w-full sm:w-auto" type="submit" :disabled="submitting">
      <Icon
        :name="submitting ? 'lucide:loader-circle' : 'lucide:send'"
        class="size-4"
        :class="{ 'animate-spin': submitting }"
        aria-hidden="true"
      />
      {{ submitting ? t("forms.contact.sending") : (submitLabel ?? t("forms.contact.submit")) }}
    </Button>
  </form>
</template>

<template>
  <!-- eslint-disable max-len -->
  <div>
    <input v-model="value"
           :value="types.ANIME"
           type="radio"
           :id="`search_type_${types.ANIME}`"
           :disabled="disabled"
           @change="$emit('update:value', $event.target.value)">
    <label :for="`search_type_${types.ANIME}`" :class="{ active: value === types.ANIME, disabled: disabled }">{{ i18n('ENUM_ANIME') }}</label>

    <input v-model="value"
           :value="types.MANGA"
           type="radio"
           :id="`search_type_${types.MANGA}`"
           :disabled="disabled"
           @change="$emit('update:value', $event.target.value)">
    <label :for="`search_type_${types.MANGA}`" :class="{ active: value === types.MANGA, disabled: disabled }">{{ i18n('ENUM_MANGA') }}</label>

    <input v-model="value"
           :value="types.STUDIOS"
           type="radio"
           :id="`search_type_${types.STUDIOS}`"
           :disabled="disabled"
           @change="$emit('update:value', $event.target.value)">
    <label :for="`search_type_${types.STUDIOS}`" :class="{ active: value === types.STUDIOS, disabled: disabled }">{{ i18n('ENUM_STUDIOS') }}</label>

    <input v-model="value"
           :value="types.CHARACTERS"
           type="radio"
           :id="`search_type_${types.CHARACTERS}`"
           :disabled="disabled"
           @change="$emit('update:value', $event.target.value)">
    <label :for="`search_type_${types.CHARACTERS}`" :class="{ active: value === types.CHARACTERS, disabled: disabled }">{{ i18n('ENUM_CHARACTERS') }}</label>

    <input v-model="value"
           :value="types.STAFF"
           type="radio"
           :id="`search_type_${types.STAFF}`"
           :disabled="disabled"
           @change="$emit('update:value', $event.target.value)">
    <label :for="`search_type_${types.STAFF}`" :class="{ active: value === types.STAFF, disabled: disabled }">{{ i18n('ENUM_STAFF') }}</label>
  </div>
  <!-- eslint-enable max-len -->
</template>

<script lang="ts">
import {
  Component,
  Mixins,
  Prop,
  Vue,
} from 'vue-property-decorator';
import * as Enum from '@/utils/Enum';
import MixinI18n from '@/mixins/I18n';

@Component
export default class InputType extends Mixins(Vue, MixinI18n) {
  /** Value */
  @Prop(String) value!: Enum.SearchType;

  /** Disabled */
  @Prop(Boolean) disabled!: boolean;

  /** Search types. */
  types = Enum.SearchType;
}
</script>

<style lang="scss" scoped>
input {
  display: none;
}

label {
  cursor: pointer;
  margin: 0 0.2rem;
  transition: color 0.3s ease, opacity .1s ease-in-out;

  &:hover,
  &.active {
    color: rgb(var(--color-header-text-hover));
  }

  &:not(.active) {
    opacity: 0.8;
  }

  &.disabled {
    cursor: initial !important;
    opacity: 0.4 !important;
    pointer-events: none !important;
  }
}
</style>

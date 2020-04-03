<template>
  <!-- eslint-disable max-len -->
  <div id="search_form">
    <!-- Search input -->
    <div id="search_row_input">
      <div class="wrapper h-full">
        <div class="h-full row row--justify-center row--items-center">
          <div class="spacer"></div>

          <div class="search_input h-full w-full">
            <!-- Input + clear button -->
            <InputSearch :value.sync="search" :disabled="disabled" @focus="handleFocus" @blur="handleBlur" @update:value="handleInputChange" >
          </div>

          <div class="spacer"></div>
        </div>
      </div>
    </div>

    <!-- Search filters -->
    <div id="search_row_filters">
      <div class="wrapper h-full">
        <div class="search_filters h-full row row--justify-between row--items-center" :class="[ type ]">
          <!-- Year select -->
          <div class="search_filters__year">
            <InputYear :value.sync="year" :disabled="disabled" :type="type" @update:value="handleInputChange" />
          </div>

          <!-- Type radios -->
          <div class="search_filters__type">
            <InputType :value.sync="type" :disabled="disabled" @update:value="handleInputChange" />
          </div>

          <!-- Season select -->
          <div class="search_filters__season">
            <InputSeason :value.sync="season" :disabled="disabled" :type="type" @update:value="handleInputChange" />
          </div>
      </div>
    </div>
  </div>
  <!-- eslint-enable max-len -->
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as Enum from '@/utils/Enum';
import InputSearch from '@/components/search/inputs/InputSearch.vue';
import InputSeason from '@/components/search/inputs/InputSeason.vue';
import InputType from '@/components/search/inputs/InputType.vue';
import InputYear from '@/components/search/inputs/InputYear.vue';

const browser = require('webextension-polyfill') // eslint-disable-line

@Component({
  components: {
    InputSearch,
    InputSeason,
    InputType,
    InputYear,
  },
})
export default class SearchForm extends Vue {
  @State('settings') settings!: AniSearch.Settings;

  @State('search') storeSearch!: AniSearch.Search.Search | null;

  /** Form disabled? */
  disabled = false;

  /** Search string. */
  search = '';

  /** Search type. */
  type: Enum.SearchType = Enum.SearchType.ANIME;

  /** Search year. */
  year: number | null = null;

  /** Search season. */
  season: Enum.SearchSeason | null = null;

  /**
   * Handle input change.
   */
  handleInputChange() {
    this.preSearch();
  }

  /**
   * On focus, emit searching event.
   */
  handleFocus() {
    this.$emit('searching', true);
  }

  /**
   * On blur, emit searching event.
   */
  handleBlur() {
    this.$emit('searching', this.search !== '');
  }

  /**
   * Watch for store search changes.
   */
  @Watch('storeSearch')
  onStoreSearchChanged(newValue: AniSearch.Search.Search | null) {
    if (!newValue || !newValue.value) return;

    this.search = newValue.value;
    this.type = newValue.type;
    this.year = newValue.year || null;
    this.season = newValue.season || null;

    this.$emit('searching', true);

    this.preSearch();
  }

  /**
   * Pre search flow.
   */
  preSearch() {
    if (this.disabled) return;

    this.disabled = true;

    // Prepare search values.
    const search = this.search.trim();
    const year = [Enum.SearchType.ANIME, Enum.SearchType.MANGA].includes(this.type) && this.year
      ? this.year
      : undefined;
    const season = [Enum.SearchType.ANIME].includes(this.type) && this.season
      ? this.season
      : undefined;

    // If search string is empty, do not execute search.
    if (!search || search === '') return;

    // Set active page to search results.
    if (this.$route.name !== 'search') this.$router.push('search');

    this.startSearch(search, this.type, year, season);
  }

  /**
   * Start search flow.
   */
  async startSearch(
    value: string,
    type: Enum.SearchType,
    year: number | undefined,
    season: Enum.SearchSeason | undefined,
  ) {
    const data: AniSearch.Search.Search = {
      value,
      type,
      year,
      season,
    };

    const response = await browser.runtime.sendMessage({
      code: 'SEARCH',
      data,
    });

    switch (response.code) {
      case 'SEARCH_SUCCESS':
        // Save search activity and refresh store asynchronously.
        this.saveActivity(value, type, year, season);

        this.$store.dispatch('searchResults', response.searchResult);
        break;

      case 'SEARCH_FAILED':
      default:
        this.$notify({
          group: 'anisearch',
          type: 'error',
          duration: -1,
          title: 'Failed to search on AniList:',
          text: response.message,
        });
        break;
    }

    this.disabled = false;
  }

  /**
   * Save executed search asynchronously.
   */
  saveActivity(
    search: string,
    type: Enum.SearchType,
    year: number | undefined,
    season: Enum.SearchSeason | undefined,
  ) {
    if (!this.settings.activity.search) return;

    const activity: AniSearch.Activity.Activity = {
      type: Enum.ActivityType.SEARCH,
      label: search,
      value: search,
      params: {
        type,
        year,
        season,
      },
    };

    browser.runtime.sendMessage({
      code: 'SAVE_ACTIVITY',
      data: activity,
    })
      .then((response: any) => {
        if (response.code !== 'SAVE_ACTIVITY_SUCCESS') {
          this.$notify({
            group: 'anisearch',
            type: 'error',
            duration: -1,
            title: 'Failed to save search:',
            text: response.message,
          });

          return;
        }

        this.$store.dispatch('refreshActivityFeed');
      });
  }
}
</script>

<style lang="scss" scoped>
#search_form{
  #search_row_input,
  #search_row_filters {
    background-color: rgb(var(--color-overlay));
    position: relative;
  }

  #search_row_input {
    height: 50px;
    z-index: 10;
  }

  #search_row_filters {
    color: rgb(var(--color-text-bright));
    font-size: 1.3rem;
    height: 35px;
    z-index: 9;
  }

  .spacer {
    width: 40px;
  }

  .search_input {
    margin: 0 1.5rem;
    position: relative;
    text-align: center;
  }

  .search_filters {
    &.MANGA,
    &.STUDIOS,
    &.CHARACTERS,
    &.STAFF {
      .search_filters__season {
        pointer-events: none;
        opacity: 0.2;
      }
    }

    &.STUDIOS,
    &.CHARACTERS,
    &.STAFF {
      .search_filters__year {
        pointer-events: none;
        opacity: 0.2;
      }
    }
  }
}
</style>
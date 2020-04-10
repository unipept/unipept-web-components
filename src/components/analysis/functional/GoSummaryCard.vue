<docs>
    This component provides 4 different slots that can be filled in to display the GO-terms associated with a specific
    item. The component automatically displays a loading state when the `loading` prop has been properly set.
</docs>

<template>
    <v-card flat>
        <v-card-text>
            <div v-if="loading" class="mpa-unavailable go">
                <h2>Biological Process</h2>
                <span class="go-waiting">
                    <v-progress-circular :size="50" :width="5" color="primary" indeterminate></v-progress-circular>
                </span>
                <h2>Cellular Component</h2>
                <span class="go-waiting">
                    <v-progress-circular :size="50" :width="5" color="primary" indeterminate></v-progress-circular>
                </span>
                <h2>Molecular Function</h2>
                <span class="go-waiting">
                    <v-progress-circular :size="50" :width="5" color="primary" indeterminate></v-progress-circular>
                </span>
            </div>
            <div v-else>
                <slot name="analysis-header"></slot>

                <div class="go-table-container">
                    <h2>Biological Process</h2>
                    <slot name="content-biological-process">
                    </slot>
                </div>

                <div class="go-table-container">
                    <h2>Cellular Component</h2>
                    <slot name="content-cellular-component">
                    </slot>
                </div>

                <div class="go-table-container">
                    <h2>Molecular Function</h2>
                    <slot name="content-molecular-function">
                    </slot>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";

@Component
export default class GoSummaryCard extends Vue {
    @Prop({ required: false, default: false })
    private loading: boolean;
}
</script>

<style>
    .go-waiting {
        margin-top: 16px;
        margin-bottom: 16px;
        display: flex;
        justify-content: center;
    }

    .go-table-container .row {
        flex-wrap: nowrap;
    }

    .go-table-container {
        margin-top: 16px;
    }
</style>

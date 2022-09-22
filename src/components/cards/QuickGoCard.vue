<template>
    <div style="height: 100%;">
        <img v-if="quickGoSmallUrl" :src="quickGoSmallUrl" class="quickGoThumb" @click="showModal = !showModal">
        <v-dialog v-if="items" v-model="showModal" max-width="90%">
            <v-card>
                <v-card-title>QuickGo {{ namespace.toString() }}</v-card-title>
                <v-card-text v-if="topN.length > 0">
                    This chart shows the relationship between the {{ topN.length }} most occurring GO terms:
                    {{ topNSentence }}.
                    <br/>
                    <a @click="openInBrowser(quickGoChartUrl)">
                        <img 
                            style="max-width: 80%; max-height: 600px; position: relative; left: 50%; transform: translateX(-50%); margin-top: 32px; margin-bottom: 32px;" 
                            :src="quickGoChartUrl" 
                            :alt="'QuickGO chart of ' + topNSentence"
                        />
                    </a>
                    <div>
                        Provided by <a @click="openInBrowser('https://www.ebi.ac.uk/QuickGO/annotations?goId=' + topN.map(x => x.code).join(','))" target="_blank">QuickGO</a>.
                    </div>
                </v-card-text>
                <v-card-text v-else>
                    No GO terms for this domain were found.
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { GoNamespace, NetworkUtils } from '@/logic';
import { computed, ref } from 'vue';
import GoTableItem from '../tables/functional/GoTableItem';

export interface Props {
    items: GoTableItem[]
    namespace: GoNamespace
    n: number
}

const props = defineProps<Props>();

const showModal = ref<boolean>(false);

const topN = computed(() => {
    if(props.items) {
        return props.items.sort((a, b) => b.count - a.count).slice(0, props.n);
    }

    return [];
});

const topNSentence = computed(() => {
    if(topN.value.length > 0) {
        return topN.value.slice(0, -1).map(x => x.name).join(', ') + (topN.value.length > 1 ? " and " : "") + topN.value.slice(-1).map(x => x.name);
    }

    return "";
});

const quickGoSmallUrl = computed(() => {
    return quickGoUrl(topN.value, false);
});

const quickGoChartUrl = computed(() => {
    return quickGoUrl(topN.value, true);
});

const quickGoUrl = (items: GoTableItem[], showKey: boolean) => {
    if (items.length > 0) {
        const terms = items.map(x => x.code).sort().join(',');
        return `https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/${terms}/chart?showKey=${showKey}`;
    }

    return undefined;
}

const openInBrowser = (url: string | undefined) => {
    if(url) {
        NetworkUtils.openInBrowser(url);
    }
}
</script>

<style scoped>
    .quickGoThumb {
        max-width: 100%;
        max-height: 300px;
        position: relative;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        cursor: pointer;
    }
</style>

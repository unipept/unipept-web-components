<template>
    <div>
        <div v-if="!trust"></div>
        <div v-else-if="trust.annotatedItems === 0">
            This panel shows the Gene Ontology annotations that were matched to your peptides. <strong>No {{ countKind.singular }}</strong> has a {{ faKind.singular }} assigned to it.
            <span v-if="clickable">Click on a row in a table to see a taxonomy tree that highlights occurrences.</span>
        </div>
        <div v-else-if="trust.annotatedItems === trust.totalAmountOfItems">
            This panel shows the Gene Ontology annotations that were matched to your peptides. <strong>All {{ countKind.plural }}</strong> have at least one {{ faKind.singular }} assigned to them.
            <span v-if="clickable">Click on a row in a table to see a taxonomy tree that highlights occurrences.</span>
        </div>
        <div v-else-if="trust.annotatedItems === 1">
            This panel shows the Gene Ontology annotations that were matched to your peptides. Only <strong>one {{ countKind.singular }}</strong> {{ computePercentage(trust) }} has at least one {{ faKind.singular }} assigned to it.
            <span v-if="clickable">Click on a row in a table to see a taxonomy tree that highlights occurrences.</span>
        </div>
        <div v-else>
            This panel shows the Gene Ontology annotations that were matched to your peptides. <strong>{{ trust.annotatedItems }} {{ countKind.plural }}</strong> {{ computePercentage(trust) }} have at least one {{ faKind.singular }} assigned to them.
            <span v-if="clickable">Click on a row in a table to see a taxonomy tree that highlights occurrences.</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { FunctionalTrust, StringUtils } from '@/logic';

export interface Props {
    trust: FunctionalTrust,
    faKind: {
        singular: string,
        plural: string
    },
    countKind: {
        singular: string,
        plural: string
    },
    clickable: boolean
}

withDefaults(defineProps<Props>(), {
    clickable: false
});

const computePercentage = (trust: FunctionalTrust) => {
    return StringUtils.numberToPercent(trust.annotatedItems / trust.totalAmountOfItems);
}
</script>

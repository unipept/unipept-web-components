<template>
    <div>
        <div v-if="!trust"></div>
        <div v-else-if="trust.annotatedItems === 0">
            <strong>No {{ countKind.singular }}</strong> has a {{ faKind.singular }} assigned to it.
        </div>
        <div v-else-if="trust.annotatedItems === trust.totalAmountOfItems">
            <strong>All {{ countKind.plural }}</strong> have at least one {{ faKind.singular }} assigned to them.
        </div>
        <div v-else-if="trust.annotatedItems === 1">
            Only <strong>one {{ countKind.singular }}</strong> {{ computePercentage(trust) }} has at least one {{ faKind.singular }} assigned to it.
        </div>
        <div v-else>
            <strong>{{ trust.annotatedItems }} {{ countKind.plural }}</strong> {{ computePercentage(trust) }} have at least one {{ faKind.singular }} assigned to them.
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
    }
}

defineProps<Props>();

const computePercentage = (trust: FunctionalTrust) => {
    return StringUtils.numberToPercent(trust.annotatedItems / trust.totalAmountOfItems);
}
</script>

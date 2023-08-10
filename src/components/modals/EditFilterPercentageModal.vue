<template>
    <v-dialog 
        v-model="dialogOpen" 
        max-width="500"
        @click:outside="onClickOutside"
    >
        <v-card>
            <v-card-title class="mb-3">
                Filter
                <v-spacer />
                <v-btn icon @click="onClickOutside">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-subtitle>
                <p>
                    By default Unipept does not report all found annotations. It uses a clever filtering technique that removes untrustworthy annotations. 
                    The strength of This filter is expressed as a percentage.
                </p>
                <ul>
                    <li><strong>0%</strong> means no filtering occurs. <br> 
                    We assign the annotation <i>A</i> to a peptide sequence <i>P</i> if there is at least one protein that contains an exact match for <i>P</i> and has been assigned the annotation <i>A</i>.
                    </li>
                    <li><strong>100%</strong> is the strongest level of filtering. <br> In this case we require that every protein that contains a certain peptide sequence <i>P</i> has the annotation <i>A</i>. before we assign the annotation <i>A</i>. to the peptide.</li>
                </ul>
                <p>
                    The default value is 5%. This means that a peptide sequence <i>P</i> is assumed to be annotated with an annotation <i>A</i> if at least 5% of the UniProt entries<a href="#fn1" class="footnote-ref" id="fnref1"><sup>1</sup></a> in which <i>P</i> occurs has been annotated with <i>A</i>.
                </p>
            </v-card-subtitle>

            <v-card-text class="mt-2 pb-0">
                <v-slider 
                    v-model="filterPercentage"
                    thumb-color="primary"
                    thumb-label="always"
                    thumb-size="22"
                    min="0"
                    max="100"
                >
                    <template #prepend>
                        <v-icon>mdi-greater-than-or-equal</v-icon>
                    </template>

                    <template #append>
                        % of annotated proteins
                    </template>
                </v-slider>
            </v-card-text>

            <v-card-actions class="pb-5 pt-0" >
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="closeDialog">Apply filter</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

export interface Props {
    modelValue: number,
    openModal: boolean
}

const props = defineProps<Props>();

const emits = defineEmits(['close', 'update:model-value'])

const dialogOpen = ref<boolean>(props.openModal);

const filterPercentage = ref<number>(props.modelValue);

const closeDialog = () => {
    dialogOpen.value = false;
    emits('update:model-value', filterPercentage.value);
    emits('close', dialogOpen.value);
}

const onClickOutside = () => {
    dialogOpen.value = false;
    emits('close', dialogOpen.value);
}

watch(() => props.openModal, (newVal) => {
    dialogOpen.value = newVal;
});

watch(() => props.modelValue, (newVal) => {
    filterPercentage.value = newVal;
});
</script>

<style scoped>
:deep(.v-input__append-outer) {
    width: 316px;
}
</style>

<template>
    <v-dialog 
        v-model="dialogOpen" 
        max-width="500"
        @click:outside="closeDialog"
    >
        <v-card>
            <v-card-title>
                Filtering
            </v-card-title>

            <v-card-text class="mt-2 pb-0">
                <v-slider 
                    v-model="filterPercentage"
                    thumb-color="primary"
                    :thumb-label="true"
                    :thumb-size="22"
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

const filterPercentage = ref<number>(5);

const closeDialog = () => {
    dialogOpen.value = false;
    emits('update:model-value', filterPercentage.value);
    emits('close', dialogOpen.value);
}

watch(() => props.openModal, async (newVal) => {
    dialogOpen.value = newVal;
});
</script>

<style scoped>
:deep(.v-input__append-outer) {
    width: 316px;
}
</style>

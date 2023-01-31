<template>
    <v-dialog 
        v-model="dialogOpen" 
        max-width="500"
        @click:outside="onClickOutside"
    >
        <v-card>
            <v-card-title>
                Filter
            </v-card-title>

            <v-card-subtitle>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
                quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum 
                dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
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

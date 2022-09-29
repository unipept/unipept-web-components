<template>
    <v-tooltip top :open-delay="500" >
        <template v-slot:activator="{ on }">
            <span v-on="on">
                <slot></slot>
            </span>
        </template>
        <span>{{ message }}</span>
    </v-tooltip>
</template>

<script setup lang='ts'>
export interface Props {
    message: string
}

defineProps<Props>();
</script>

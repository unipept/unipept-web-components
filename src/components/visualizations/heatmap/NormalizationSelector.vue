<template>
    <div>
        <p>Please select the type of normalization that should be performed before visualizing data points.</p>
        <v-radio-group v-model="normalizer">
            <div
                v-for="normalizationType of normalizationTypes.keys()"
                :key="normalizationType" 
                style="margin-bottom: 8px;"
            >
                    <v-radio :label="normalizationType" :value="normalizationType"></v-radio>
                    <div style="margin-left: 32px;">
                        {{ normalizationTypes.get(normalizationType)?.information || "" }}
                    </div>
            </div>
        </v-radio-group>
    </div>
</template>

<script setup lang="ts">
import { AllNormalizer, ColumnNormalizer, Normalizer, RowNormalizer } from '@/logic/normalization';
import { onMounted, ref, watch } from 'vue';

const normalizationTypes: Map<string, {information: string, factory: () => Normalizer}> = new Map([
    [
        "All", 
        {
            information: "Normalize over all data points of the input. Values are normalized with respect to the global maximum and minimum value.",
            factory: () => new AllNormalizer()
        }
    ], 
    [
        "Rows",
        {
            information: "Normalize values on a row-per-row basis. Values are normalized with respect to the maximum and minimum value in their respective row.",
            factory: () => new RowNormalizer()
        }
    ],
    [
        "Columns",
        {
            information: "Normalize values on a column-per-column basis. Values are normalized with respect to the maximum and minimum value in their respective column.",
            factory: () => new ColumnNormalizer()
        }
    ]
]);

const normalizer = ref<string>("All");

const emits = defineEmits(["update"]);

console.log(normalizationTypes)
console.log(normalizationTypes.keys())
for(const i in normalizationTypes.keys()) {
    console.log(i)
}
for(const i of normalizationTypes.keys()) {
    console.log(i)
}

const log = (event: any) => {
    console.log(event);
}

onMounted(() => {
    emits("update", normalizationTypes.get(normalizer.value)?.factory());
});

watch(normalizer, (newValue) => {
    emits("update", normalizationTypes.get(newValue)?.factory());
});
</script>
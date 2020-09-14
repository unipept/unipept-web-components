import Vue from "vue";
export default class SearchSetingsForm extends Vue {
    disabled: boolean;
    equateIl: boolean;
    filterDuplicates: boolean;
    missingCleavage: boolean;
    /**
     * Show the component in a horizontal or vertical fashion? Set to true to show the different checkboxes on one line.
     */
    private horizontal;
    private equateIlData;
    private filterDuplicatesData;
    private missingCleavageData;
    onEquateIlChanged(): void;
    onFilterDuplicatesChanged(): void;
    onMissingCleavageChanged(): void;
}

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";

@Component
export default class DataSourceMixin extends Vue {
    protected headers = [
        {
            text: "Name",
            align: "left",
            value: "name",
            width: "40%"
        },
        {
            text: "Code",
            align: "left",
            value: "code",
            width: "40%"
        }
    ];

    protected capitalize(input: string): string {
        return input.split(" ").map(el => el.length > 0 ? el.substr(0, 1).toUpperCase() + el.substr(1) : el).join(" ");
    }
}
</script>

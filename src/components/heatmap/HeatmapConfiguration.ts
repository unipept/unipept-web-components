import {Normalizer} from "@/logic/heatmap/Normalizer";
import DataSource from "@/logic/data-source/DataSource";
import Element from "@/logic/data-source/Element";

export default class HeatmapConfiguration {
    public normalizer: Normalizer = null;
    public horizontalDataSource: DataSource = null;
    public horizontalLoading: boolean = false;
    public verticalDataSource: DataSource = null;
    public verticalLoading: boolean = false;

    public horizontalSelectedItems: Element[] = [];
    public verticalSelectedItems: Element[] = [];
}

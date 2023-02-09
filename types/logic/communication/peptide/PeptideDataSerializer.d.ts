import Serializable from "shared-memory-datastructures/dist/encoding/Serializable";
import PeptideData from "./PeptideData";
export default class PeptideDataSerializer implements Serializable<PeptideData> {
    decode(buffer: ArrayBuffer): PeptideData;
    encode(object: PeptideData): ArrayBuffer;
}

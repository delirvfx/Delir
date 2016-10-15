namespace Delir.Document {
    export type AssetEntry = {
        name : string;
        type : AssetEntryType;
        entries? : Array<AssetEntry>;
    };
}

class ProjectAssetDirectory implements IProjectAssetEntry
{
    private _name: string;

    getName(): string { return this._name; }
    setName(newName: string) { this._name = newName; }
    getType(): string { return "Directory"; }
}

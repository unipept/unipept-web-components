export enum InterproNameSpace {
    ActiveSite = "active site",
    BindingSite = "binding site",
    ConservedSite = "conserved site",
    Domain = "domain",
    Family = "family",
    HomologousSuperfamily = "homologous superfamily",
    PTM = "ptm",
    Repeat = "repeat"
}

export function convertStringToInterproNameSpace(ns: string): InterproNameSpace {
    const mapping: Map<String, InterproNameSpace> = new Map([
        ["active site", InterproNameSpace.ActiveSite],
        ["binding site", InterproNameSpace.BindingSite],
        ["conserved site", InterproNameSpace.ConservedSite],
        ["domain", InterproNameSpace.Domain],
        ["family", InterproNameSpace.Family],
        ["homologous superfamily", InterproNameSpace.HomologousSuperfamily],
        ["ptm", InterproNameSpace.PTM],
        ["repeat", InterproNameSpace.Repeat]
    ]);

    return mapping.get(ns.toLowerCase());
}

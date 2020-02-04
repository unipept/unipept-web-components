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
        ["active_site", InterproNameSpace.ActiveSite],
        ["binding_site", InterproNameSpace.BindingSite],
        ["conserved_site", InterproNameSpace.ConservedSite],
        ["domain", InterproNameSpace.Domain],
        ["family", InterproNameSpace.Family],
        ["homologous_superfamily", InterproNameSpace.HomologousSuperfamily],
        ["ptm", InterproNameSpace.PTM],
        ["repeat", InterproNameSpace.Repeat]
    ]);

    return mapping[ns.toLowerCase()];
}

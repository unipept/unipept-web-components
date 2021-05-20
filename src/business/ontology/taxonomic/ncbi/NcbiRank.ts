export enum NcbiRank {
    Superkingdom = "superkingdom",
    Kingdom = "kingdom",
    Subkingdom = "subkingdom",
    Superphylum = "superphylum",
    Phylum = "phylum",
    Subphylum = "subphylum",
    Superclass = "superclass",
    Class = "class",
    Subclass = "subclass",
    Superorder = "superorder",
    Order = "order",
    Suborder = "suborder",
    Infraorder = "infraorder",
    Superfamily = "superfamily",
    Family = "family",
    Subfamily = "subfamily",
    Tribe = "tribe",
    Subtribe = "subtribe",
    Genus = "genus",
    Subgenus = "subgenus",
    SpeciesGroup = "species group",
    SpeciesSubgroup = "species subgroup",
    Species = "species",
    Subspecies = "subspecies",
    Strain = "strain",
    Varietas = "varietas",
    Forma = "forma"
}

// export enum NcbiRank {
//     Superkingdom = "superkingdom",
//     Kingdom = "kingdom",
//     Subkingdom = "subkingdom",
//     Superphylum = "superphylum",
//     Phylum = "phylum",
//     Subphylum = "subphylum",
//     Superclass = "superclass",
//     Class = "class",
//     Subclass = "subclass",
//     Infraclass = "infraclass",
//     Superorder = "superorder",
//     Order = "order",
//     Suborder = "suborder",
//     Infraorder = "infraorder",
//     Parvorder = "parvorder",
//     Superfamily = "superfamily",
//     Family = "family",
//     Subfamily = "subfamily",
//     Tribe = "tribe",
//     Subtribe = "subtribe",
//     Genus = "genus",
//     Subgenus = "subgenus",
//     SpeciesGroup = "species group",
//     SpeciesSubgroup = "species subgroup",
//     Species = "species",
//     Subspecies = "subspecies",
//     Varietas = "varietas",
//     Forma = "forma",
// }

export function convertStringToRank(rank: string): NcbiRank {
    rank = rank.toLowerCase();
    for (const ns of Object.values(NcbiRank)) {
        if (ns === rank) {
            return ns;
        }
    }
    return null;
}

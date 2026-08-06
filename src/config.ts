import tokens from "../brand/tokens.json";

// Source unique de vérité du nom du projet : brand/tokens.json → ce module.
// Ne jamais coder le nom en dur ailleurs (voir brand/README.md).
export const SITE_NAME: string = tokens.name;

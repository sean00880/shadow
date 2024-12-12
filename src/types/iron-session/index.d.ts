import "iron-session";

declare module "iron-session" {
  interface IronSessionData {
    nonce?: string;
    siwe?: {
      address: string;
      chainId: number;
    };
  }
}

declare module "next" {
  interface NextApiRequest {
    session: IronSessionData;
  }
}

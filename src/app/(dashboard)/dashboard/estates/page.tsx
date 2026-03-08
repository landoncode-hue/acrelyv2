import { EstateService } from "@/lib/services/EstateService";
import { EstateClient } from "./estate-client";

export const metadata = {
    title: "Estates | Acrely",
};

export default async function EstatesPage() {
    const estateService = new EstateService();
    const estates = await estateService.getEstates();

    return (
        <EstateClient initialEstates={JSON.parse(JSON.stringify(estates))} />
    );
}

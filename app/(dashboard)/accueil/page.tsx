import PageShell from "@/components/page_layout/PageShell"
import PageHeader from "@/components/page_layout/PageHeader"
import CalendarViewClient from "@/components/accueil/CalendarViewClient"

export default function Accueil() {
    return (
        <PageShell>
            <PageHeader title= "Calendrier des évènements" />
            {/* <Publish /> */}

            <CalendarViewClient />
        </PageShell>
    )
}

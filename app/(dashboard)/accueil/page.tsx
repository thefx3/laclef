import PageShell from "@/components/page_layout/PageShell"
import PageHeader from "@/components/page_layout/PageHeader"
import CalendarView from "@/components/accueil/CalendarView"

export default function Accueil() {
    return (
        <PageShell>
            <PageHeader title= "Calendrier des évènements" />
            {/* <Publish /> */}

            <CalendarView />
        </PageShell>
    )
}
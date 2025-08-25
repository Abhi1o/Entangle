import DashHeader from "@/components/layout/DashHeader"
import Footer from "@/components/layout/footer"

const HeaderFooterLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <DashHeader />
            {children}
            <Footer />
        </>
    )
}

export default HeaderFooterLayout
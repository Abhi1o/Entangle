import DashHeader from "@/components/layout/DashHeader";

const CreateEventLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <DashHeader />
            {children}
        </>
    );
};

export default CreateEventLayout;

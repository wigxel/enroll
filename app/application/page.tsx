import ApplicationForm from "@/components/forms/ApplicationForm";

export const metadata = {
    title: "Application Form - Enrollment System",
    description: "Submit your application for enrollment",
};

export default function ApplicationPage() {
    return (
        <div className="space-y-6 flex flex-col">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                    Student Application
                </h1>
                <p className="text-gray-500 mt-2 text-sm">
                    Please fill out the form below to apply for our program. All fields
                    marked with an asterisk (*) are required.
                </p>
            </div>

            <div className="mt-8">
                <ApplicationForm />
            </div>
        </div>
    );
}

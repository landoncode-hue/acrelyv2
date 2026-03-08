export default function TermsPage() {
    return (
        <div className="container max-w-3xl py-12">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <div className="prose">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <p>
                    Welcome to Acrely. By using our website and services, you agree to comply with and be bound by the following terms and conditions.
                </p>
                <h3>1. Acceptance of Terms</h3>
                <p>
                    By accessing or using our Service, you agree to be bound by these Terms using our Service.
                </p>
                <h3>2. Use of Service</h3>
                <p>
                    You must follow any policies made available to you within the Service. You may use our Service only as permitted by law.
                </p>
                {/* More terms... */}
            </div>
        </div>
    );
}

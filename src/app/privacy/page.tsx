export default function PrivacyPage() {
    return (
        <div className="container max-w-3xl py-12">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <div className="prose">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <p>
                    Your privacy is important to us. It is Acrely's policy to respect your privacy regarding any information we may collect from you across our website.
                </p>
                <h3>1. Information We Collect</h3>
                <p>
                    We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.
                </p>
                <h3>2. How We Use Information</h3>
                <p>
                    We use the collected information to provide, update, maintain and improve our services.
                </p>
                {/* More terms... */}
            </div>
        </div>
    );
}

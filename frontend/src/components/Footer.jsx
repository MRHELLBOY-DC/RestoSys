export default function Footer({ 
    showCredits = true, 
    customText = null,
    className = ""
}) {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer 
            className={className}
            style={{
                background: 'linear-gradient(135deg, rgba(30,8,8,0.95) 0%, rgba(15,5,5,0.98) 100%)',
                borderTop: '1px solid rgba(240,85,77,0.2)',
                padding: '20px 0',
                textAlign: 'center',
                marginTop: 'auto'
            }}
        >
            <p className="text-white-50 mb-1 small">
                {customText || `© ${currentYear} RestoSys - Todos los derechos reservados`}
            </p>
            {showCredits && (
                <div className="small text-white-50">
                    <span>Luis Alfredo Vargas Pizarro</span> | <span>Eduardo Durana</span>
                </div>
            )}
        </footer>
    );
}
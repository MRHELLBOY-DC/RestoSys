export default function Footer({
    showCredits = true,
    customText = null,
    className = "",
    light = false
}) {
    const currentYear = new Date().getFullYear();

    const style = light
        ? {
            background: '#ffffff',
            borderTop: '1px solid #ebe1d5',
            padding: '14px 0',
            textAlign: 'center',
            marginTop: 'auto'
        }
        : {
            background: 'linear-gradient(135deg, rgba(30,8,8,0.95) 0%, rgba(15,5,5,0.98) 100%)',
            borderTop: '1px solid rgba(240,85,77,0.2)',
            padding: '14px 0',
            textAlign: 'center',
            marginTop: 'auto'
        };

    const iconColor = light ? '#c23d12' : 'rgba(255,255,255,0.7)';
    const iconBg = light ? '#ffeee4' : 'rgba(255,255,255,0.08)';
    const iconHoverColor = '#ffffff';
    const iconHoverBg = light ? '#e4531f' : '#f0554d';

    return (
        <footer className={className} style={style}>
            <div className="d-flex justify-content-center gap-2 mb-2">
                {[
                    ['fa-whatsapp', 'WhatsApp'],
                    ['fa-facebook', 'Facebook'],
                    ['fa-x-twitter', 'X'],
                    ['fa-instagram', 'Instagram'],
                ].map(([icon, label]) => (
                    <a
                        key={icon}
                        href="#"
                        aria-label={label}
                        className="footer-social-icon"
                        style={{
                            color: iconColor,
                            background: iconBg,
                            fontSize: '14px',
                            '--hover-color': iconHoverColor,
                            '--hover-bg': iconHoverBg,
                        }}
                    >
                        <i className={`fa-brands ${icon}`}></i>
                    </a>
                ))}
            </div>
            <p className={`mb-1 small ${light ? 'text-muted' : 'text-white-50'}`}>
                {customText || `© ${currentYear} RestoSys - Todos los derechos reservados`}
            </p>
            {showCredits && (
                <div className={`small ${light ? 'text-muted' : 'text-white-50'}`}>
                    <span>Luis Alfredo Vargas Pizarro</span> | <span>Eduardo Durana</span>
                </div>
            )}

            <style>{`
                .footer-social-icon {
                    width: 28px;
                    height: 28px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: color 0.15s ease, background-color 0.15s ease, transform 0.15s ease;
                }
                .footer-social-icon:hover {
                    color: var(--hover-color);
                    background-color: var(--hover-bg);
                    transform: translateY(-2px);
                }
            `}</style>
        </footer>
    );
}
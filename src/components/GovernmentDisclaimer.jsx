import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const GovernmentDisclaimer = () => {
  const { lang } = useLanguage();
  const isHindi = lang === 'hi';

  const content = {
    en: {
      disclaimer: "Peekolitix is an independent, non-partisan AI intelligence platform. It is NOT affiliated with, authorized, or endorsed by any government entity or political party.",
      sourceNote: "All government information, legislative bills, and policy data analyzed by our AI are sourced from official public domains including:",
      sources: [
        { name: "National Portal of India", url: "https://www.india.gov.in" },
        { name: "Digital Sansad (Parliament)", url: "https://sansad.in" },
        { name: "Press Information Bureau (PIB)", url: "https://pib.gov.in" },
        { name: "Election Commission of India", url: "https://www.eci.gov.in" }
      ]
    },
    hi: {
      disclaimer: "Peekolitix एक स्वतंत्र, गैर-पक्षपाती AI इंटेलिजेंस प्लेटफॉर्म है। यह किसी भी सरकारी संस्था या राजनीतिक दल से संबद्ध, अधिकृत या समर्थित नहीं है।",
      sourceNote: "हमारे AI द्वारा विश्लेषण की गई सभी सरकारी जानकारी, विधायी विधेयकों और नीतिगत डेटा आधिकारिक सार्वजनिक डोमेन से प्राप्त किए जाते हैं, जिनमें शामिल हैं:",
      sources: [
        { name: "भारत का राष्ट्रीय पोर्टल", url: "https://www.india.gov.in" },
        { name: "डिजिटल संसद (संसद)", url: "https://sansad.in" },
        { name: "पत्र सूचना कार्यालय (PIB)", url: "https://pib.gov.in" },
        { name: "भारत निर्वाचन आयोग", url: "https://www.eci.gov.in" }
      ]
    }
  };

  const current = isHindi ? content.hi : content.en;

  return (
    <div className="gov-disclaimer-card" style={{
      marginTop: '24px',
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      fontSize: '0.75rem',
      color: 'rgba(255, 255, 255, 0.6)',
      lineHeight: '1.4'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ffd166' }}>
        <ShieldCheck size={14} />
        <strong style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Government Information Disclaimer</strong>
      </div>
      
      <p style={{ marginBottom: '12px' }}>{current.disclaimer}</p>
      
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px' }}>
        <p style={{ marginBottom: '8px', fontWeight: '500' }}>{current.sourceNote}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {current.sources.map(src => (
            <a 
              key={src.url} 
              href={src.url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'var(--brand-purple-hover)', 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {src.name} <ExternalLink size={10} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GovernmentDisclaimer;

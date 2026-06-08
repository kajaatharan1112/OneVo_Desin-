import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import './module-showcase.css';

import workManagementIcon from '../../../Animation/work managemnt.svg';
import developmentProcessIcon from '../../../Animation/organizing-projects-animate.svg';
import shareIcon from '../../../Animation/Share.svg';
import softwareIcon from '../../../Animation/Software.svg';

const modules = [
  {
    id: 1,
    title: 'Core HR',
    subtitle: 'CORE HR',
    icon: <img src={workManagementIcon} alt="Core HR" className="module-animated-icon" />,
    color: '#3B82F6', // Blue
    bg: '#EFF6FF',
    linkText: 'Explore Modules'
  },
  {
    id: 2,
    title: 'Work Management',
    subtitle: 'WORK MGMT',
    icon: <img src={developmentProcessIcon} alt="Work Management" className="module-animated-icon" />,
    color: '#F97316', // Orange
    bg: '#FFF7ED',
    linkText: 'Explore Modules'
  },
  {
    id: 3,
    title: 'Collaboration Chat',
    subtitle: 'COLLAB CHAT',
    icon: <img src={shareIcon} alt="Collaboration Chat" className="module-animated-icon" />,
    color: '#EC4899', // Pink
    bg: '#FDF2F8',
    linkText: 'View Details'
  },
  {
    id: 4,
    title: 'Employee Monitoring',
    subtitle: 'MONITORING',
    icon: <img src={softwareIcon} alt="Employee Monitoring" className="module-animated-icon" />,
    color: '#10B981', // Green
    bg: '#ECFDF5',
    linkText: 'View Details'
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

export const ModuleShowcase: React.FC = () => {
  return (
    <section className="module-showcase" id="modules">
      <div className="module-showcase-container">
        
        <motion.div 
          className="module-showcase-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2>Project Scope & Functional Specification</h2>
        </motion.div>

        <motion.div 
          className="module-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {modules.map((mod, index) => (
            <motion.div 
              key={mod.id} 
              className="module-card"
              variants={cardVariants}
              whileHover={{ y: -5, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)' }}
            >
              <div className="module-card-top">
                <div 
                  className="module-icon-box" 
                  style={{ backgroundColor: mod.bg, color: mod.color }}
                >
                  {mod.icon}
                </div>
                <div className="module-title-group">
                  <span className="module-subtitle" style={{ color: mod.color }}>
                    {mod.subtitle}
                  </span>
                  <h3 className="module-title">
                    {index + 1}. {mod.title}
                  </h3>
                </div>
              </div>
              
              <div className="module-card-divider"></div>
              
              <div className="module-card-bottom">
                <a 
                  href={`#${mod.subtitle.toLowerCase().replace(' ', '-')}`} 
                  className="module-link" 
                  style={{ color: mod.color }}
                >
                  {mod.linkText} <ArrowRight size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

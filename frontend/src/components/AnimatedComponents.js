import React from 'react';
import { Card, Button } from 'antd';
import './AnimatedComponents.css';

export const FloatingActionButton = ({ icon, onClick, tooltip }) => (
    <div className="floating-action-button" onClick={onClick} title={tooltip}>
        {icon}
    </div>
);

export const PulseCard = ({ children, ...props }) => (
    <Card {...props} className={`pulse-card ${props.className || ''}`}>
        {children}
    </Card>
);
 
export const ShakeButton = ({ children, ...props }) => (
    <Button {...props} className={`shake-button ${props.className || ''}`}>
        {children}
    </Button>
);

export const FadeInCard = ({ children, delay = 0, ...props }) => (
    <Card
        {...props}
        className={`fade-in-card ${props.className || ''}`}
        style={{
            ...props.style,
            animationDelay: `${delay}ms`
        }}
    >
        {children}
    </Card>
);

export const SlideInFromLeft = ({ children, delay = 0 }) => (
    <div
        className="slide-in-left"
        style={{ animationDelay: `${delay}ms` }}
    >
        {children}
    </div>
);
 
export const SlideInFromRight = ({ children, delay = 0 }) => (
    <div
        className="slide-in-right"
        style={{ animationDelay: `${delay}ms` }}
    >
        {children}
    </div>
);

export const BounceIn = ({ children, delay = 0 }) => (
    <div
        className="bounce-in"
        style={{ animationDelay: `${delay}ms` }}
    >
        {children}
    </div>
);
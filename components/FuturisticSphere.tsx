
import React from 'react';

const FuturisticSphere: React.FC = () => (
  <div className="sphere-container">
    <div className="sphere">
      <div className="sphere-pattern-1"></div>
      <div className="sphere-pattern-2"></div>
      <div className="sphere-texture"></div>
    </div>
  </div>
);

export default React.memo(FuturisticSphere);
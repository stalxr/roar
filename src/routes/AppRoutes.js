import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EquipmentSection from '../components/EquipmentSection';
import EquipmentDetail from '../components/EquipmentDetail';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<EquipmentSection />} />
      <Route path="/equipment/:id" element={<EquipmentDetail />} />
    </Routes>
  );
}

export default AppRoutes;



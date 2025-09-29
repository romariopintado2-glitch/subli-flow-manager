import { useState } from 'react';
import { OrderItem, WorkSchedule } from '@/types/sublimation';
import { timeData } from '@/data/timeData';

const workSchedule: WorkSchedule = {
  startHour: 8,
  endHour: 18,
  lunchStart: 13,
  lunchEnd: 14
};

export const useTimeCalculator = () => {
  const calculateOrderTime = (items: OrderItem[], designTime: number) => {
    // Calculate total production time in minutes
    let totalProductionTime = 0;
    
    items.forEach(item => {
      const prodTime = timeData.production[item.prenda];
      const timePerUnit = prodTime.impresion + prodTime.cortado + prodTime.planchado + prodTime.control + prodTime.imprevisto;
      totalProductionTime += timePerUnit * item.cantidad;
    });

    // Convert design time from hours to minutes
    const designTimeMinutes = designTime * 60;
    
    const totalTime = designTimeMinutes + totalProductionTime;
    
    return {
      designTime: designTimeMinutes,
      productionTime: totalProductionTime,
      totalTime
    };
  };

  const calculateDeliveryTime = (totalMinutes: number, startDate?: Date) => {
    const start = startDate || new Date();
    const deliveryDate = new Date(start);
    
    let remainingMinutes = totalMinutes;
    let currentHour = start.getHours();
    let currentMinute = start.getMinutes();
    
    // Adjust to work hours if starting outside
    if (currentHour < workSchedule.startHour) {
      currentHour = workSchedule.startHour;
      currentMinute = 0;
    } else if (currentHour >= workSchedule.endHour) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      currentHour = workSchedule.startHour;
      currentMinute = 0;
    }
    
    while (remainingMinutes > 0) {
      // Check if we're in lunch time
      if (currentHour === workSchedule.lunchStart && currentMinute === 0) {
        currentHour = workSchedule.lunchEnd;
        continue;
      }
      
      // Calculate remaining work minutes in current day
      let workMinutesLeft = (workSchedule.endHour - currentHour) * 60 - currentMinute;
      
      // Subtract lunch time if we haven't passed it yet
      if (currentHour < workSchedule.lunchStart) {
        workMinutesLeft -= 60; // lunch hour
      }
      
      if (remainingMinutes <= workMinutesLeft) {
        // Can finish today
        const hoursToAdd = Math.floor(remainingMinutes / 60);
        const minutesToAdd = remainingMinutes % 60;
        
        currentHour += hoursToAdd;
        currentMinute += minutesToAdd;
        
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60);
          currentMinute = currentMinute % 60;
        }
        
        // Skip lunch time if we land on it
        if (currentHour === workSchedule.lunchStart && currentMinute > 0) {
          currentHour = workSchedule.lunchEnd;
        }
        
        deliveryDate.setHours(currentHour, currentMinute, 0, 0);
        remainingMinutes = 0;
      } else {
        // Move to next day
        remainingMinutes -= workMinutesLeft;
        deliveryDate.setDate(deliveryDate.getDate() + 1);
        currentHour = workSchedule.startHour;
        currentMinute = 0;
      }
    }
    
    return deliveryDate;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return {
    calculateOrderTime,
    calculateDeliveryTime,
    formatTime,
    workSchedule
  };
};
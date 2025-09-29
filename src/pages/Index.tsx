import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddOrderDialog } from '@/components/AddOrderDialog';
import { OrdersTable } from '@/components/OrdersTable';
import { ScheduleView } from '@/components/ScheduleView';
import { Order, OrderItem } from '@/types/sublimation';
import { useTimeCalculator } from '@/hooks/useTimeCalculator';
import { BarChart3, Clock, Calendar, Settings } from 'lucide-react';

const Index = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { calculateOrderTime, calculateDeliveryTime } = useTimeCalculator();

  const handleAddOrder = (cliente: string, items: OrderItem[], designTime: number) => {
    const timeCalc = calculateOrderTime(items, designTime);
    const deliveryDate = calculateDeliveryTime(timeCalc.totalTime);
    
    const newOrder: Order = {
      id: crypto.randomUUID(),
      cliente,
      items,
      tiempoDiseno: designTime,
      tiempoTotal: timeCalc.totalTime,
      fechaCreacion: new Date(),
      fechaEntregaEstimada: deliveryDate,
      status: 'pending',
      procesos: {
        diseno: { completado: false },
        impresion: { completado: false },
        cortado: { completado: false },
        planchado: { completado: false },
        control: { completado: false }
      }
    };

    setOrders(prev => [...prev, newOrder]);
  };

  const handleUpdateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2">
            Sistema de Gestión de Sublimación
          </h1>
          <p className="text-muted-foreground text-lg">
            Control completo de diseño, impresión, cortado y planchado
          </p>
        </div>

        <div className="mb-6">
          <AddOrderDialog onAddOrder={handleAddOrder} />
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Programación
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendario
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <OrdersTable orders={orders} onUpdateOrder={handleUpdateOrder} />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <ScheduleView orders={orders} />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Vista de Calendario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Vista de Calendario</h3>
                  <p className="text-muted-foreground">
                    Próximamente: Vista de calendario con entregas programadas
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;

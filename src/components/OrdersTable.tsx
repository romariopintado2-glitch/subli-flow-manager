import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Play, Pause } from 'lucide-react';
import { Order } from '@/types/sublimation';
import { useTimeCalculator } from '@/hooks/useTimeCalculator';

interface OrdersTableProps {
  orders: Order[];
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
}

export const OrdersTable = ({ orders, onUpdateOrder }: OrdersTableProps) => {
  const { formatTime } = useTimeCalculator();

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'in-design': { label: 'En Diseño', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      'in-production': { label: 'En Producción', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      'in-planchado': { label: 'En Planchado', className: 'bg-orange-100 text-orange-800 border-orange-200' },
      completed: { label: 'Completado', className: 'bg-green-100 text-green-800 border-green-200' }
    };

    const config = statusConfig[status];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const startProcess = (orderId: string, process: keyof Order['procesos']) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const now = new Date();
    const updatedProcesos = {
      ...order.procesos,
      [process]: {
        ...order.procesos[process],
        inicio: now,
        completado: false
      }
    };

    // Update status based on process
    let newStatus = order.status;
    if (process === 'diseno') newStatus = 'in-design';
    else if (process === 'impresion' || process === 'cortado') newStatus = 'in-production';
    else if (process === 'planchado') newStatus = 'in-planchado';

    onUpdateOrder(orderId, {
      procesos: updatedProcesos,
      status: newStatus
    });
  };

  const completeProcess = (orderId: string, process: keyof Order['procesos']) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const now = new Date();
    const updatedProcesos = {
      ...order.procesos,
      [process]: {
        ...order.procesos[process],
        fin: now,
        completado: true
      }
    };

    // Check if all processes are completed
    const allCompleted = Object.entries(updatedProcesos).every(([_, proc]) => proc.completado);
    const newStatus = allCompleted ? 'completed' : order.status;

    onUpdateOrder(orderId, {
      procesos: updatedProcesos,
      status: newStatus
    });
  };

  const getProcessButton = (order: Order, process: keyof Order['procesos'], label: string) => {
    const proc = order.procesos[process];
    
    if (proc.completado) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completado
        </Badge>
      );
    }

    if (proc.inicio && !proc.fin) {
      return (
        <div className="flex gap-1">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            En proceso
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => completeProcess(order.id, process)}
            className="h-6 px-2 text-xs"
          >
            Finalizar
          </Button>
        </div>
      );
    }

    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => startProcess(order.id, process)}
        className="h-6 px-2 text-xs"
      >
        <Play className="w-3 h-3 mr-1" />
        Iniciar
      </Button>
    );
  };

  const formatItemsDisplay = (items: Order['items']) => {
    return items.map(item => {
      const prendaNames = {
        polo: 'Polo',
        poloMangaLarga: 'Polo M.L.',
        short: 'Short',
        faldaShort: 'Falda Short',
        pantaloneta: 'Pantaloneta'
      };
      return `${item.cantidad} ${prendaNames[item.prenda]}`;
    }).join(', ');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Gestión de Pedidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">Cliente</TableHead>
                <TableHead className="min-w-[200px]">Prendas</TableHead>
                <TableHead className="min-w-[80px]">Tiempo Total</TableHead>
                <TableHead className="min-w-[120px]">Entrega Est.</TableHead>
                <TableHead className="min-w-[100px]">Estado</TableHead>
                <TableHead className="min-w-[120px]">Diseño</TableHead>
                <TableHead className="min-w-[120px]">Impresión</TableHead>
                <TableHead className="min-w-[120px]">Cortado</TableHead>
                <TableHead className="min-w-[120px]">Planchado</TableHead>
                <TableHead className="min-w-[120px]">Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    No hay pedidos registrados
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{order.cliente}</TableCell>
                    <TableCell className="text-sm">{formatItemsDisplay(order.items)}</TableCell>
                    <TableCell className="font-mono text-sm">{formatTime(order.tiempoTotal)}</TableCell>
                    <TableCell className="text-sm">
                      {order.fechaEntregaEstimada.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getProcessButton(order, 'diseno', 'Diseño')}</TableCell>
                    <TableCell>{getProcessButton(order, 'impresion', 'Impresión')}</TableCell>
                    <TableCell>{getProcessButton(order, 'cortado', 'Cortado')}</TableCell>
                    <TableCell>{getProcessButton(order, 'planchado', 'Planchado')}</TableCell>
                    <TableCell>{getProcessButton(order, 'control', 'Control')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
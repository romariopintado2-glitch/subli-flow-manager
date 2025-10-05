import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Order } from '@/types/sublimation';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DesignViewProps {
  orders: Order[];
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
}

export const DesignView = ({ orders, onUpdateOrder }: DesignViewProps) => {
  const { toast } = useToast();
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const designOrders = orders.filter(o => 
    o.status === 'pending' || o.status === 'in-design'
  );

  const handleImageUpload = (orderId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un archivo de imagen',
        variant: 'destructive'
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdateOrder(orderId, { imagenDiseño: reader.result as string });
      setUploadingId(null);
      toast({
        title: 'Imagen cargada',
        description: 'La imagen del diseño se ha guardado correctamente'
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (orderId: string) => {
    onUpdateOrder(orderId, { imagenDiseño: undefined });
    toast({
      title: 'Imagen eliminada',
      description: 'La imagen del diseño se ha eliminado'
    });
  };

  const getStatusBadge = (status: Order['status']) => {
    const config = {
      pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'in-design': { label: 'En Diseño', className: 'bg-blue-100 text-blue-800 border-blue-200' }
    };
    const statusConfig = config[status as keyof typeof config];
    return (
      <Badge variant="outline" className={statusConfig.className}>
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Diseños a Trabajar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {designOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay diseños pendientes en este momento
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designOrders.map(order => (
                <Card key={order.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-4">
                    {/* Header */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{order.nombrePedido}</h3>
                          <p className="text-sm text-muted-foreground">Cliente: {order.cliente}</p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      {order.diseñador && (
                        <p className="text-sm text-muted-foreground">
                          Diseñador: <span className="font-medium">{order.diseñador}</span>
                        </p>
                      )}
                    </div>

                    {/* Image Area */}
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden relative group">
                      {order.imagenDiseño ? (
                        <>
                          <img 
                            src={order.imagenDiseño} 
                            alt={`Diseño ${order.nombrePedido}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(order.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                          <ImageIcon className="w-12 h-12 mb-2" />
                          <p className="text-sm">Sin imagen</p>
                        </div>
                      )}
                    </div>

                    {/* Upload Button */}
                    <div>
                      <Label htmlFor={`upload-${order.id}`} className="cursor-pointer">
                        <div className="flex items-center justify-center gap-2 p-2 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">
                            {order.imagenDiseño ? 'Cambiar imagen' : 'Subir imagen'}
                          </span>
                        </div>
                      </Label>
                      <Input
                        id={`upload-${order.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadingId(order.id);
                            handleImageUpload(order.id, file);
                          }
                        }}
                      />
                    </div>

                    {/* Order Details */}
                    <div className="pt-2 border-t space-y-1">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Prendas: </span>
                        {order.items.map(item => `${item.cantidad} ${item.prenda}`).join(', ')}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Tiempo diseño: </span>
                        {order.tiempoDiseno}h
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Entrega: </span>
                        {order.fechaEntregaEstimada.toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

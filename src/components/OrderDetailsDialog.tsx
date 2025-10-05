import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Order } from '@/types/sublimation';
import { Cliente } from '@/types/cliente';
import { Badge } from '@/components/ui/badge';
import { useTimeCalculator } from '@/hooks/useTimeCalculator';
import { Calendar, User, MapPin, Phone, FileText, Pencil, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderDetailsDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
}

export const OrderDetailsDialog = ({ order, open, onOpenChange, onUpdateOrder }: OrderDetailsDialogProps) => {
  const { formatTime } = useTimeCalculator();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [descripcion, setDescripcion] = useState(order.descripcionPedido || '');
  const [cliente, setCliente] = useState<Cliente | null>(null);

  useEffect(() => {
    if (order.clienteId) {
      const clientesStorage = localStorage.getItem('clientes');
      if (clientesStorage) {
        const clientes = JSON.parse(clientesStorage);
        const foundCliente = clientes.find((c: Cliente) => c.id === order.clienteId);
        setCliente(foundCliente || null);
      }
    }
  }, [order.clienteId]);

  const handleSaveDescripcion = () => {
    onUpdateOrder(order.id, { descripcionPedido: descripcion });
    setIsEditing(false);
  };

  const handleFileUpload = (file: File, type: 'fotoLista' | 'archivoImpresion') => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('application/')) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un archivo válido',
        variant: 'destructive'
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'fotoLista') {
        onUpdateOrder(order.id, { fotoLista: reader.result as string });
      } else {
        const currentFiles = order.archivosImpresion || [];
        onUpdateOrder(order.id, { archivosImpresion: [...currentFiles, reader.result as string] });
      }
      toast({
        title: 'Archivo cargado',
        description: 'El archivo se ha guardado correctamente'
      });
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (type: 'fotoLista' | 'archivoImpresion', index?: number) => {
    if (type === 'fotoLista') {
      onUpdateOrder(order.id, { fotoLista: undefined });
    } else if (index !== undefined) {
      const currentFiles = order.archivosImpresion || [];
      onUpdateOrder(order.id, { archivosImpresion: currentFiles.filter((_, i) => i !== index) });
    }
  };

  const formatItemsDisplay = (items: Order['items']) => {
    return items.map(item => {
      const prendaNames = {
        polo: 'Polo',
        poloMangaLarga: 'Polo Manga Larga',
        short: 'Short',
        faldaShort: 'Falda Short',
        pantaloneta: 'Pantaloneta'
      };
      return `${item.cantidad} ${prendaNames[item.prenda]}`;
    }).join(', ');
  };

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'in-design': { label: 'En Diseño', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      'in-production': { label: 'En Producción', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      'in-planchado': { label: 'En Planchado', className: 'bg-orange-100 text-orange-800 border-orange-200' },
      completed: { label: 'Completado', className: 'bg-green-100 text-green-800 border-green-200' },
      archived: { label: 'Archivado', className: 'bg-gray-100 text-gray-800 border-gray-200' }
    };

    const config = statusConfig[status];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Detalles del Pedido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del Pedido */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{order.nombrePedido}</h3>
              {getStatusBadge(order.status)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Fecha de Creación</p>
                  <p className="font-medium">
                    {order.fechaCreacion.toLocaleString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Entrega Estimada</p>
                  <p className="font-medium">
                    {order.fechaEntregaEstimada.toLocaleString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-muted-foreground text-sm">Tiempo Total</p>
              <p className="text-xl font-bold font-mono">{formatTime(order.tiempoTotal)}</p>
            </div>
          </div>

          {/* Información del Cliente */}
          {cliente && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Información del Cliente
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nombre</p>
                  <p className="font-medium">{cliente.nombre}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">WhatsApp</p>
                    <Button
                      variant="link"
                      className="h-auto p-0 font-medium text-primary hover:underline"
                      onClick={() => window.open(`https://wa.me/${cliente.celular.replace(/\D/g, '')}`, '_blank')}
                    >
                      {cliente.celular}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Distrito</p>
                    <p className="font-medium">{cliente.distrito}</p>
                  </div>
                </div>
                
                {cliente.descripcion && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Descripción del Cliente</p>
                    <p className="font-medium">{cliente.descripcion}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prendas del Pedido */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <h3 className="font-semibold">Prendas del Pedido</h3>
            <p className="text-sm">{formatItemsDisplay(order.items)}</p>
          </div>

          {/* Diseñador */}
          {order.diseñador && (
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Diseñador Asignado
              </h3>
              <p className="font-medium">{order.diseñador}</p>
            </div>
          )}

          {/* Descripción del Pedido */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Descripción del Pedido
              </h3>
              {!isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  Editar
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Añade detalles sobre el pedido..."
                  rows={4}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDescripcion(order.descripcionPedido || '');
                      setIsEditing(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveDescripcion}>
                    Guardar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {order.descripcionPedido || 'Sin descripción'}
              </p>
            )}
          </div>

          {/* Archivos */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Archivos
            </h3>

            {/* Foto de Lista */}
            <div className="space-y-2">
              <Label>Foto de Lista del Pedido</Label>
              {order.fotoLista ? (
                <div className="relative group">
                  <img 
                    src={order.fotoLista} 
                    alt="Lista del pedido"
                    className="w-full max-h-48 object-contain rounded-lg border"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile('fotoLista')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Label htmlFor="foto-lista" className="cursor-pointer">
                  <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Subir foto de lista</span>
                  </div>
                </Label>
              )}
              <Input
                id="foto-lista"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'fotoLista');
                }}
              />
            </div>

            {/* Archivos de Impresión */}
            <div className="space-y-2">
              <Label>Archivos para Impresión</Label>
              {order.archivosImpresion && order.archivosImpresion.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {order.archivosImpresion.map((archivo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={archivo}
                        alt={`Archivo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFile('archivoImpresion', index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Label htmlFor="archivos-impresion" className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Subir archivos de impresión</span>
                </div>
              </Label>
              <Input
                id="archivos-impresion"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(file => handleFileUpload(file, 'archivoImpresion'));
                }}
              />
            </div>
          </div>

          {/* Estado de Procesos */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-3">
            <h3 className="font-semibold">Estado de Procesos</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries(order.procesos).map(([key, proc]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${proc.completado ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="capitalize">{key}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
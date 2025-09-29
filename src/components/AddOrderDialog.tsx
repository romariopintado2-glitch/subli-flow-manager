import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { OrderItem } from '@/types/sublimation';
import { useTimeCalculator } from '@/hooks/useTimeCalculator';

interface AddOrderDialogProps {
  onAddOrder: (cliente: string, items: OrderItem[], designTime: number) => void;
}

export const AddOrderDialog = ({ onAddOrder }: AddOrderDialogProps) => {
  const [open, setOpen] = useState(false);
  const [cliente, setCliente] = useState('');
  const [designTime, setDesignTime] = useState(0.5);
  const [items, setItems] = useState<OrderItem[]>([
    { prenda: 'polo', cantidad: 1 }
  ]);
  
  const { calculateOrderTime, formatTime } = useTimeCalculator();

  const addItem = () => {
    setItems([...items, { prenda: 'polo', cantidad: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = () => {
    if (cliente.trim() && items.length > 0) {
      onAddOrder(cliente, items, designTime);
      setCliente('');
      setDesignTime(0.5);
      setItems([{ prenda: 'polo', cantidad: 1 }]);
      setOpen(false);
    }
  };

  const timeCalculation = calculateOrderTime(items, designTime);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Pedido
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Agregar Nuevo Pedido
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="cliente">Cliente</Label>
            <Input
              id="cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nombre del cliente"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="designTime">Tiempo de Diseño (horas)</Label>
            <Input
              id="designTime"
              type="number"
              step="0.5"
              min="0"
              max="8"
              value={designTime}
              onChange={(e) => setDesignTime(parseFloat(e.target.value) || 0)}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Entre 10 minutos (0.2h) y 2 horas máximo
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Prendas del Pedido</Label>
              <Button onClick={addItem} size="sm" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3 items-end p-3 border rounded-lg bg-card">
                  <div className="flex-1">
                    <Label className="text-sm">Tipo de Prenda</Label>
                    <Select
                      value={item.prenda}
                      onValueChange={(value: any) => updateItem(index, 'prenda', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="polo">Polo</SelectItem>
                        <SelectItem value="poloMangaLarga">Polo Manga Larga</SelectItem>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="faldaShort">Falda Short</SelectItem>
                        <SelectItem value="pantaloneta">Pantaloneta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-24">
                    <Label className="text-sm">Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => updateItem(index, 'cantidad', parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                  </div>
                  
                  {items.length > 1 && (
                    <Button
                      onClick={() => removeItem(index)}
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-medium">Estimación de Tiempo</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Diseño:</span>
                <span className="ml-2 font-mono">{formatTime(timeCalculation.designTime)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Producción:</span>
                <span className="ml-2 font-mono">{formatTime(timeCalculation.productionTime)}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-border">
                <span className="text-muted-foreground">Total:</span>
                <span className="ml-2 font-mono font-bold">{formatTime(timeCalculation.totalTime)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!cliente.trim()}>
              Crear Pedido
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
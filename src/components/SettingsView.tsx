import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings as SettingsIcon, Plus, Trash2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TimeCalculation } from '@/types/sublimation';

interface SettingsData {
  timeData: TimeCalculation;
  diseñadores: string[];
}

export const SettingsView = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsData>({
    timeData: {
      design: {
        polo: 6,
        poloMangaLarga: 0,
        short: 0,
        faldaShort: 0,
        pantaloneta: 0
      },
      production: {
        polo: { impresion: 9, cortado: 1, planchado: 3, control: 1, imprevisto: 1 },
        poloMangaLarga: { impresion: 10, cortado: 1, planchado: 3, control: 1, imprevisto: 2 },
        short: { impresion: 7, cortado: 1, planchado: 2, control: 1, imprevisto: 1 },
        faldaShort: { impresion: 7, cortado: 1, planchado: 2, control: 1, imprevisto: 1 },
        pantaloneta: { impresion: 7, cortado: 1, planchado: 2, control: 1, imprevisto: 1 }
      }
    },
    diseñadores: []
  });

  const [newDiseñador, setNewDiseñador] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('settings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const saveSettings = (data: SettingsData) => {
    setSettings(data);
    localStorage.setItem('settings', JSON.stringify(data));
    toast({
      title: 'Configuración guardada',
      description: 'Los cambios se han guardado correctamente'
    });
  };

  const updateProductionTime = (
    prenda: keyof TimeCalculation['production'],
    proceso: keyof TimeCalculation['production']['polo'],
    value: number
  ) => {
    const newSettings = {
      ...settings,
      timeData: {
        ...settings.timeData,
        production: {
          ...settings.timeData.production,
          [prenda]: {
            ...settings.timeData.production[prenda],
            [proceso]: Math.max(0, value)
          }
        }
      }
    };
    saveSettings(newSettings);
  };

  const addDiseñador = () => {
    if (newDiseñador.trim() && !settings.diseñadores.includes(newDiseñador.trim())) {
      saveSettings({
        ...settings,
        diseñadores: [...settings.diseñadores, newDiseñador.trim()]
      });
      setNewDiseñador('');
      setDialogOpen(false);
    }
  };

  const removeDiseñador = (nombre: string) => {
    saveSettings({
      ...settings,
      diseñadores: settings.diseñadores.filter(d => d !== nombre)
    });
  };

  const prendaLabels = {
    polo: 'Polo',
    poloMangaLarga: 'Polo Manga Larga',
    short: 'Short',
    faldaShort: 'Falda Short',
    pantaloneta: 'Pantaloneta'
  };

  const procesoLabels = {
    impresion: 'Impresión',
    cortado: 'Cortado',
    planchado: 'Planchado',
    control: 'Control',
    imprevisto: 'Imprevisto'
  };

  return (
    <div className="space-y-6">
      {/* Tiempos de Producción */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Tiempos de Producción (minutos por unidad)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {(Object.keys(settings.timeData.production) as Array<keyof TimeCalculation['production']>).map(prenda => (
            <div key={prenda} className="space-y-3">
              <h3 className="font-semibold text-lg border-b pb-2">{prendaLabels[prenda]}</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {(Object.keys(settings.timeData.production[prenda]) as Array<keyof TimeCalculation['production']['polo']>).map(proceso => (
                  <div key={proceso}>
                    <Label htmlFor={`${prenda}-${proceso}`} className="text-xs">
                      {procesoLabels[proceso]}
                    </Label>
                    <Input
                      id={`${prenda}-${proceso}`}
                      type="number"
                      min="0"
                      step="0.1"
                      value={settings.timeData.production[prenda][proceso]}
                      onChange={(e) => updateProductionTime(prenda, proceso, parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Nota:</strong> Los tiempos de impresión son promedios considerando diferentes tallas. 
              Estos tiempos se utilizarán para calcular la fecha de entrega estimada de los pedidos.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Diseñadores */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Diseñadores
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Diseñador
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Añadir Diseñador</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nuevo-diseñador">Nombre del Diseñador</Label>
                    <Input
                      id="nuevo-diseñador"
                      value={newDiseñador}
                      onChange={(e) => setNewDiseñador(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      onKeyDown={(e) => e.key === 'Enter' && addDiseñador()}
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={addDiseñador} disabled={!newDiseñador.trim()}>
                      Añadir
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {settings.diseñadores.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay diseñadores registrados. Añade uno usando el botón de arriba.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {settings.diseñadores.map(diseñador => (
                <Card key={diseñador}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="font-medium">{diseñador}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeDiseñador(diseñador)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
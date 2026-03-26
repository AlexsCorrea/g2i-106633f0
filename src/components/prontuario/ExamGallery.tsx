import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useExamGallery, useCreateExamGalleryItem, useUpdateExamGalleryItem, uploadExamFile, ExamGalleryItem } from "@/hooks/useExamGallery";
import { useAuth } from "@/contexts/AuthContext";
import { ModuleSection } from "./sections/ModuleSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Image, Upload, Grid3X3, List, Clock, Columns, Filter, X, ZoomIn, ZoomOut,
  Maximize, ChevronLeft, ChevronRight, Play, FileText, Video, Eye, Search,
  Pencil, Circle, Square, ArrowRight, Type, Eraser, Save, Trash2, Download, RotateCcw,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// ====== MOCK DATA ======
const MOCK_DATA: Omit<ExamGalleryItem, "id" | "created_at" | "updated_at">[] = [
  // 26/03/2026 - Multiple exams same day
  { patient_id: "", exam_date: "2026-03-26", title: "Retinografia OD", category: "Retinografia", laterality: "OD", file_url: "/placeholder.svg", file_type: "image", file_name: "retinografia_od_1.jpg", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", observations: "Fundo de olho sem alterações", tags: ["oftalmologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-26", title: "Retinografia OE", category: "Retinografia", laterality: "OE", file_url: "/placeholder.svg", file_type: "image", file_name: "retinografia_oe_1.jpg", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-26", title: "Retinografia AO Panorâmica", category: "Retinografia", laterality: "AO", file_url: "/placeholder.svg", file_type: "image", file_name: "retinografia_ao.jpg", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-26", title: "OCT Macular OD", category: "OCT", laterality: "OD", file_url: "/placeholder.svg", file_type: "image", file_name: "oct_od.jpg", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", report_text: "Espessura macular central dentro dos limites normais. Sem edema.", tags: ["oftalmologia", "macula"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-26", title: "OCT Macular OE", category: "OCT", laterality: "OE", file_url: "/placeholder.svg", file_type: "image", file_name: "oct_oe.jpg", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-26", title: "Topografia Corneana OD", category: "Topografia Corneana", laterality: "OD", file_url: "/placeholder.svg", file_type: "image", file_name: "topo_od.jpg", status: "recebido", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia", "cornea"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-26", title: "Topografia Corneana OE", category: "Topografia Corneana", laterality: "OE", file_url: "/placeholder.svg", file_type: "image", file_name: "topo_oe.jpg", status: "recebido", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-26", title: "Vídeo Gonioscopia", category: "Vídeo Clínico", file_url: "/placeholder.svg", file_type: "video", file_name: "gonioscopia.mp4", status: "recebido", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia", "video"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-26", title: "Laudo Oftalmológico Completo", category: "PDF de Laudo", file_url: "/placeholder.svg", file_type: "pdf", file_name: "laudo_oftalmo.pdf", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", report_text: "Exame oftalmológico completo sem alterações significativas.", tags: ["laudo"], annotations: [], metadata: {} },
  // 23/03/2026
  { patient_id: "", exam_date: "2026-03-23", title: "Raio-X Tórax PA", category: "Raio-X", file_url: "/placeholder.svg", file_type: "image", file_name: "rx_torax_pa.jpg", status: "laudado", professional_name: "Dra. Carla Souza", origin: "Radiologia", report_text: "Campos pulmonares livres. Área cardíaca dentro da normalidade. Sem alterações mediastinais.", tags: ["radiologia", "torax"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-23", title: "Raio-X Tórax Perfil", category: "Raio-X", file_url: "/placeholder.svg", file_type: "image", file_name: "rx_torax_perfil.jpg", status: "laudado", professional_name: "Dra. Carla Souza", origin: "Radiologia", tags: ["radiologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-23", title: "Laudo Raio-X Tórax", category: "PDF de Laudo", file_url: "/placeholder.svg", file_type: "pdf", file_name: "laudo_rx_torax.pdf", status: "laudado", professional_name: "Dra. Carla Souza", origin: "Radiologia", tags: ["laudo"], annotations: [], metadata: {} },
  // 12/02/2026
  { patient_id: "", exam_date: "2026-02-12", title: "Biometria Ultrassônica OD", category: "Biometria", laterality: "OD", file_url: "/placeholder.svg", file_type: "image", file_name: "biometria_od_1.jpg", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-02-12", title: "Biometria Ultrassônica OE", category: "Biometria", laterality: "OE", file_url: "/placeholder.svg", file_type: "image", file_name: "biometria_oe_1.jpg", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-02-12", title: "Biometria Óptica IOL Master", category: "Biometria", laterality: "AO", file_url: "/placeholder.svg", file_type: "image", file_name: "biometria_iol.jpg", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-02-12", title: "Campimetria OD", category: "Campimetria", laterality: "OD", file_url: "/placeholder.svg", file_type: "image", file_name: "campimetria_od.jpg", status: "recebido", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia", "campo_visual"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-02-12", title: "Campimetria OE", category: "Campimetria", laterality: "OE", file_url: "/placeholder.svg", file_type: "image", file_name: "campimetria_oe.jpg", status: "recebido", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-02-12", title: "Relatório Biometria", category: "PDF de Laudo", file_url: "/placeholder.svg", file_type: "pdf", file_name: "relatorio_biometria.pdf", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["laudo"], annotations: [], metadata: {} },
  // 06/10/2025
  { patient_id: "", exam_date: "2025-10-06", title: "OCT Nervo Óptico", category: "OCT", laterality: "AO", file_url: "/placeholder.svg", file_type: "image", file_name: "oct_nervo.jpg", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", report_text: "CFNR dentro dos limites normais em ambos os olhos.", tags: ["oftalmologia", "glaucoma"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2025-10-06", title: "Foto Clínica Pálpebra", category: "Foto Clínica", file_url: "/placeholder.svg", file_type: "image", file_name: "foto_palpebra_1.jpg", status: "recebido", professional_name: "Dra. Ana Lima", origin: "Ambulatório", tags: ["foto_clinica"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2025-10-06", title: "Foto Clínica Lesão Cutânea", category: "Foto Clínica", file_url: "/placeholder.svg", file_type: "image", file_name: "foto_lesao.jpg", status: "recebido", professional_name: "Dra. Ana Lima", origin: "Dermatologia", tags: ["foto_clinica", "dermatologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2025-10-06", title: "Ultrassom Abdominal", category: "Ultrassom", file_url: "/placeholder.svg", file_type: "video", file_name: "usg_abdominal.mp4", status: "laudado", professional_name: "Dr. Paulo Santos", origin: "Radiologia", report_text: "Fígado, vesícula e rins sem alterações.", tags: ["radiologia", "abdomen"], annotations: [], metadata: {} },
];

const CATEGORIES = [
  "Retinografia", "OCT", "Topografia Corneana", "Biometria", "Campimetria",
  "Foto Clínica", "Raio-X", "Tomografia", "Ressonância", "Ultrassom",
  "Ecocardiograma", "Endoscopia", "Vídeo Clínico", "PDF de Laudo", "Outros",
];

const STATUS_COLORS: Record<string, string> = {
  solicitado: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  recebido: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  em_analise: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  laudado: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  revisado: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const FILE_TYPE_ICON: Record<string, React.ElementType> = {
  image: Image,
  video: Video,
  pdf: FileText,
  dicom: Eye,
};

interface ExamGalleryProps {
  patientId: string;
}

export function ExamGallery({ patientId }: ExamGalleryProps) {
  const { data: dbItems = [] } = useExamGallery(patientId);
  const createItem = useCreateExamGalleryItem();
  const { user } = useAuth();

  // Combine DB items with mock items that have matching patient
  const allItems = useMemo(() => {
    const mockWithId = MOCK_DATA.map((m, i) => ({
      ...m,
      id: `mock-${i}`,
      patient_id: patientId,
      created_at: `${m.exam_date}T10:00:00Z`,
      updated_at: `${m.exam_date}T10:00:00Z`,
    })) as ExamGalleryItem[];
    return [...dbItems, ...mockWithId].sort((a, b) => b.exam_date.localeCompare(a.exam_date));
  }, [dbItems, patientId]);

  const [viewMode, setViewMode] = useState<"date" | "category" | "timeline" | "compare">("date");
  const [showFilters, setShowFilters] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [viewerItem, setViewerItem] = useState<ExamGalleryItem | null>(null);
  const [compareItems, setCompareItems] = useState<ExamGalleryItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterLaterality, setFilterLaterality] = useState<string>("all");
  const [filterFileType, setFilterFileType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [annotating, setAnnotating] = useState(false);
  const [annotationTool, setAnnotationTool] = useState<string>("circle");
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Filter items
  const filtered = useMemo(() => {
    return allItems.filter(item => {
      if (filterCategory !== "all" && item.category !== filterCategory) return false;
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      if (filterLaterality !== "all" && item.laterality !== filterLaterality) return false;
      if (filterFileType !== "all" && item.file_type !== filterFileType) return false;
      if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase()) && !item.category.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [allItems, filterCategory, filterStatus, filterLaterality, filterFileType, searchTerm]);

  // Group by date then category
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Record<string, ExamGalleryItem[]>> = {};
    filtered.forEach(item => {
      const dateKey = item.exam_date;
      if (!groups[dateKey]) groups[dateKey] = {};
      if (!groups[dateKey][item.category]) groups[dateKey][item.category] = [];
      groups[dateKey][item.category].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  // Group by category
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, ExamGalleryItem[]> = {};
    filtered.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const addToCompare = (item: ExamGalleryItem) => {
    if (compareItems.length >= 3) { toast.info("Máximo de 3 itens na comparação"); return; }
    if (compareItems.find(c => c.id === item.id)) { toast.info("Item já adicionado"); return; }
    setCompareItems(prev => [...prev, item]);
    toast.success("Adicionado à comparação");
  };

  const removeFromCompare = (id: string) => setCompareItems(prev => prev.filter(c => c.id !== id));

  const openViewer = (item: ExamGalleryItem) => {
    setViewerItem(item);
    setZoom(1);
    setAnnotations(item.annotations || []);
    setAnnotating(false);
  };

  const navigateViewer = (dir: number) => {
    if (!viewerItem) return;
    const idx = filtered.findIndex(i => i.id === viewerItem.id);
    const next = filtered[idx + dir];
    if (next) openViewer(next);
  };

  // Upload handler
  const handleUpload = async (files: FileList, meta: { title: string; category: string; examDate: string; laterality?: string; observations?: string }) => {
    for (const file of Array.from(files)) {
      try {
        const url = await uploadExamFile(file, patientId);
        const fileType = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : file.type === "application/pdf" ? "pdf" : "image";
        await createItem.mutateAsync({
          patient_id: patientId,
          title: meta.title || file.name,
          category: meta.category || "Outros",
          exam_date: meta.examDate || new Date().toISOString().split("T")[0],
          laterality: meta.laterality || null,
          file_url: url,
          file_type: fileType,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          status: "recebido",
          observations: meta.observations || null,
          uploaded_by: user?.id || null,
          annotations: [],
          metadata: {},
          tags: [],
        });
      } catch (e) {
        toast.error(`Erro ao enviar ${file.name}`);
      }
    }
    setShowUpload(false);
  };

  const FileTypeIcon = ({ type }: { type: string }) => {
    const Icon = FILE_TYPE_ICON[type] || Image;
    return <Icon className="h-4 w-4" />;
  };

  // ============= RENDER FUNCTIONS =============

  const renderThumbnail = (item: ExamGalleryItem, size: "sm" | "md" = "sm") => {
    const sizeClass = size === "md" ? "w-24 h-24" : "w-16 h-16";
    const isPlaceholder = item.file_url === "/placeholder.svg";

    return (
      <div className={`${sizeClass} rounded-lg overflow-hidden bg-muted/50 border border-border flex items-center justify-center relative group cursor-pointer`} onClick={() => openViewer(item)}>
        {item.file_type === "image" ? (
          isPlaceholder ? (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <Image className="h-6 w-6 text-muted-foreground/50" />
            </div>
          ) : (
            <img src={item.file_url} alt={item.title} className="w-full h-full object-cover" />
          )
        ) : item.file_type === "video" ? (
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-950/30 flex items-center justify-center">
            <Play className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-950/30 flex items-center justify-center">
            <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {item.laterality && (
          <Badge className="absolute top-0.5 right-0.5 text-[8px] px-1 h-4 bg-primary/80 text-primary-foreground">{item.laterality}</Badge>
        )}
      </div>
    );
  };

  const renderFilters = () => (
    <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 p-3 bg-muted/30 rounded-lg border border-border ${showFilters ? "" : "hidden"}`}>
      <div>
        <Label className="text-[10px]">Categoria</Label>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-[10px]">Status</Label>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="solicitado">Solicitado</SelectItem>
            <SelectItem value="recebido">Recebido</SelectItem>
            <SelectItem value="em_analise">Em Análise</SelectItem>
            <SelectItem value="laudado">Laudado</SelectItem>
            <SelectItem value="revisado">Revisado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-[10px]">Lateralidade</Label>
        <Select value={filterLaterality} onValueChange={setFilterLaterality}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="OD">OD</SelectItem>
            <SelectItem value="OE">OE</SelectItem>
            <SelectItem value="AO">AO</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-[10px]">Tipo de Arquivo</Label>
        <Select value={filterFileType} onValueChange={setFilterFileType}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="image">Imagens</SelectItem>
            <SelectItem value="video">Vídeos</SelectItem>
            <SelectItem value="pdf">PDFs</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Label className="text-[10px]">Buscar</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input className="h-8 text-xs pl-7" placeholder="Buscar exame..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>
    </div>
  );

  const renderDateView = () => (
    <div className="space-y-6">
      {groupedByDate.map(([date, categories]) => (
        <div key={date} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              {format(parseISO(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h3>
            <Badge variant="secondary" className="text-[10px] h-5">
              {Object.values(categories).flat().length} arquivos • {Object.keys(categories).length} exames
            </Badge>
          </div>
          <div className="ml-4 space-y-3">
            {Object.entries(categories).sort(([a], [b]) => a.localeCompare(b)).map(([cat, items]) => (
              <div key={cat} className="medical-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileTypeIcon type={items[0].file_type} />
                    <span className="text-xs font-semibold">{cat}</span>
                    <Badge variant="outline" className="text-[9px] h-4">{items.length} {items.length === 1 ? "arquivo" : "arquivos"}</Badge>
                  </div>
                  <div className="flex gap-1">
                    {items[0].professional_name && <span className="text-[10px] text-muted-foreground">{items[0].professional_name}</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map(item => (
                    <div key={item.id} className="flex flex-col items-center gap-1">
                      {renderThumbnail(item, "md")}
                      <div className="text-center max-w-[96px]">
                        <p className="text-[9px] truncate text-foreground">{item.title}</p>
                        <div className="flex items-center gap-1 justify-center">
                          <Badge className={`text-[8px] px-1 h-3.5 ${STATUS_COLORS[item.status] || ""}`}>{item.status}</Badge>
                          {item.report_text && <FileText className="h-2.5 w-2.5 text-green-600" />}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-5 text-[9px] px-1" onClick={(e) => { e.stopPropagation(); addToCompare(item); }}>
                        + Comparar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {groupedByDate.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Image className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Nenhum exame encontrado</p>
          <p className="text-xs mt-1">Ajuste os filtros ou faça upload de novos arquivos</p>
          <Button size="sm" className="mt-3" onClick={() => setShowUpload(true)}>
            <Upload className="h-3.5 w-3.5 mr-1" /> Upload
          </Button>
        </div>
      )}
    </div>
  );

  const renderCategoryView = () => (
    <div className="space-y-4">
      {groupedByCategory.map(([cat, items]) => (
        <div key={cat} className="medical-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileTypeIcon type={items[0].file_type} />
            <h3 className="text-sm font-semibold">{cat}</h3>
            <Badge variant="secondary" className="text-[10px] h-5">{items.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map(item => (
              <div key={item.id} className="flex flex-col items-center gap-1">
                {renderThumbnail(item)}
                <p className="text-[9px] text-muted-foreground">{format(parseISO(item.exam_date), "dd/MM/yy")}</p>
                {item.laterality && <Badge className="text-[8px] px-1 h-3.5" variant="outline">{item.laterality}</Badge>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTimeline = () => (
    <div className="relative pl-6">
      <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
      {groupedByDate.map(([date, categories]) => (
        <div key={date} className="relative mb-6">
          <div className="absolute -left-4 w-3 h-3 rounded-full bg-primary border-2 border-background" />
          <div className="ml-2">
            <p className="text-xs font-semibold text-primary mb-2">{format(parseISO(date), "dd/MM/yyyy", { locale: ptBR })}</p>
            {Object.entries(categories).map(([cat, items]) => (
              <div key={cat} className="mb-2 p-2 rounded-lg bg-muted/30 border border-border">
                <p className="text-[10px] font-medium mb-1">{cat} ({items.length})</p>
                <div className="flex gap-1.5 flex-wrap">
                  {items.slice(0, 4).map(item => renderThumbnail(item, "sm"))}
                  {items.length > 4 && <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">+{items.length - 4}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderCompareView = () => (
    <div className="space-y-4">
      {compareItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Columns className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Nenhum item selecionado para comparação</p>
          <p className="text-xs mt-1">Use o botão "+ Comparar" nas miniaturas para adicionar itens</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{compareItems.length} de 3 itens</Badge>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setCompareItems([])}>
              <Trash2 className="h-3 w-3 mr-1" /> Limpar Comparação
            </Button>
          </div>
          <div className={`grid gap-3 ${compareItems.length === 1 ? "grid-cols-1" : compareItems.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {compareItems.map(item => (
              <div key={item.id} className="medical-card p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{item.category} • {format(parseISO(item.exam_date), "dd/MM/yyyy")}</p>
                    {item.laterality && <Badge variant="outline" className="text-[8px] mt-0.5">{item.laterality}</Badge>}
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeFromCompare(item.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden bg-muted/50 border flex items-center justify-center cursor-pointer" onClick={() => openViewer(item)} style={{ transform: `scale(${zoom})` }}>
                  {item.file_type === "image" ? (
                    item.file_url === "/placeholder.svg" ? (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center"><Image className="h-12 w-12 text-muted-foreground/30" /></div>
                    ) : <img src={item.file_url} className="w-full h-full object-contain" />
                  ) : item.file_type === "video" ? (
                    <div className="w-full h-full bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center"><Play className="h-12 w-12 text-purple-500" /></div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center"><FileText className="h-12 w-12 text-red-500" /></div>
                  )}
                </div>
                {item.report_text && <div className="p-2 rounded bg-muted/50 text-[10px]">{item.report_text}</div>}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Zoom:</Label>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}><ZoomOut className="h-3 w-3" /></Button>
            <span className="text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.min(3, z + 0.25))}><ZoomIn className="h-3 w-3" /></Button>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(1)}><RotateCcw className="h-3 w-3" /></Button>
          </div>
        </>
      )}
    </div>
  );

  // ============= VIEWER DIALOG =============
  const renderViewer = () => {
    if (!viewerItem) return null;
    return (
      <Dialog open={!!viewerItem} onOpenChange={() => setViewerItem(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <div>
              <p className="text-sm font-semibold">{viewerItem.title}</p>
              <p className="text-[10px] text-muted-foreground">{viewerItem.category} • {format(parseISO(viewerItem.exam_date), "dd/MM/yyyy")} {viewerItem.laterality ? `• ${viewerItem.laterality}` : ""} {viewerItem.professional_name ? `• ${viewerItem.professional_name}` : ""}</p>
            </div>
            <div className="flex items-center gap-1">
              <Badge className={`text-[9px] ${STATUS_COLORS[viewerItem.status] || ""}`}>{viewerItem.status}</Badge>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigateViewer(-1)}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigateViewer(1)}><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}><ZoomOut className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.min(3, z + 0.25))}><ZoomIn className="h-4 w-4" /></Button>
              <Button variant={annotating ? "default" : "ghost"} size="sm" className="h-7 w-7 p-0" onClick={() => setAnnotating(!annotating)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => addToCompare(viewerItem)}>
                <Columns className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Main viewer */}
            <div className="flex-1 relative overflow-auto bg-black/5 dark:bg-black/30 flex items-center justify-center">
              {viewerItem.file_type === "image" ? (
                <div style={{ transform: `scale(${zoom})`, transition: "transform 0.2s" }} className="relative">
                  {viewerItem.file_url === "/placeholder.svg" ? (
                    <div className="w-96 h-96 bg-gradient-to-br from-muted to-muted/30 rounded-lg flex items-center justify-center">
                      <Image className="h-24 w-24 text-muted-foreground/20" />
                    </div>
                  ) : (
                    <img src={viewerItem.file_url} alt={viewerItem.title} className="max-w-full max-h-full object-contain" />
                  )}
                  {/* Annotation overlay */}
                  {annotating && (
                    <div className="absolute inset-0">
                      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
                    </div>
                  )}
                </div>
              ) : viewerItem.file_type === "video" ? (
                <div className="w-full max-w-2xl p-4">
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    {viewerItem.file_url !== "/placeholder.svg" ? (
                      <video src={viewerItem.file_url} controls className="w-full h-full rounded-lg" />
                    ) : (
                      <div className="text-center">
                        <Play className="h-16 w-16 text-white/50 mx-auto mb-2" />
                        <p className="text-white/50 text-sm">{viewerItem.file_name}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-2xl p-4">
                  {viewerItem.file_url !== "/placeholder.svg" ? (
                    <iframe src={viewerItem.file_url} className="w-full h-full rounded-lg border" />
                  ) : (
                    <div className="aspect-[3/4] bg-white dark:bg-muted rounded-lg flex items-center justify-center border">
                      <div className="text-center">
                        <FileText className="h-16 w-16 text-red-300 mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">{viewerItem.file_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Annotation toolbar */}
            {annotating && (
              <div className="w-10 border-l flex flex-col items-center py-2 gap-1 bg-background">
                {[
                  { id: "circle", icon: Circle },
                  { id: "square", icon: Square },
                  { id: "arrow", icon: ArrowRight },
                  { id: "text", icon: Type },
                  { id: "free", icon: Pencil },
                  { id: "eraser", icon: Eraser },
                ].map(t => (
                  <Button key={t.id} variant={annotationTool === t.id ? "default" : "ghost"} size="sm" className="h-7 w-7 p-0" onClick={() => setAnnotationTool(t.id)}>
                    <t.icon className="h-3.5 w-3.5" />
                  </Button>
                ))}
                <div className="border-t w-full my-1" />
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toast.success("Anotações salvas")}>
                  <Save className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setAnnotations([])}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* Side panel - report */}
            {viewerItem.report_text && (
              <div className="w-64 border-l p-3 overflow-auto bg-background">
                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" /> Laudo
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{viewerItem.report_text}</p>
                <div className="mt-3 pt-3 border-t">
                  <h4 className="text-xs font-semibold mb-1">Metadados</h4>
                  <div className="space-y-1 text-[10px] text-muted-foreground">
                    <p>Arquivo: {viewerItem.file_name}</p>
                    <p>Categoria: {viewerItem.category}</p>
                    {viewerItem.origin && <p>Origem: {viewerItem.origin}</p>}
                    {viewerItem.equipment && <p>Equipamento: {viewerItem.equipment}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // ============= UPLOAD DIALOG =============
  const UploadDialog = () => {
    const [files, setFiles] = useState<FileList | null>(null);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Outros");
    const [examDate, setExamDate] = useState(new Date().toISOString().split("T")[0]);
    const [laterality, setLaterality] = useState("");
    const [observations, setObservations] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const onDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) setFiles(e.dataTransfer.files);
    }, []);

    return (
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Upload de Arquivos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onDragOver={e => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Arraste arquivos aqui ou clique para enviar</p>
              <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG, WEBP, PDF, MP4, AVI, MKV</p>
              {files && <p className="text-xs text-primary mt-2">{files.length} arquivo(s) selecionado(s)</p>}
              <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf" className="hidden" onChange={e => setFiles(e.target.files)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Título do Exame</Label>
                <Input className="h-8 text-xs" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Retinografia OD" />
              </div>
              <div>
                <Label className="text-xs">Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Data do Exame</Label>
                <Input type="date" className="h-8 text-xs" value={examDate} onChange={e => setExamDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Lateralidade</Label>
                <Select value={laterality} onValueChange={setLaterality}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N/A">Não aplicável</SelectItem>
                    <SelectItem value="OD">OD - Olho Direito</SelectItem>
                    <SelectItem value="OE">OE - Olho Esquerdo</SelectItem>
                    <SelectItem value="AO">AO - Ambos os Olhos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Observações</Label>
              <Textarea className="text-xs min-h-[60px]" value={observations} onChange={e => setObservations(e.target.value)} placeholder="Observações opcionais..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowUpload(false)}>Cancelar</Button>
            <Button size="sm" disabled={!files || createItem.isPending} onClick={() => files && handleUpload(files, { title, category, examDate, laterality: laterality || undefined, observations })}>
              {createItem.isPending ? "Enviando..." : "Enviar Arquivos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // ============= MAIN RENDER =============
  return (
    <div className="space-y-4">
      <ModuleSection
        title="Galeria de Exames"
        icon={Image}
        description="Visualização, comparação e gerenciamento de exames e imagens clínicas"
        onAdd={() => setShowUpload(true)}
        addLabel="Upload"
        recordCount={filtered.length}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Button variant={viewMode === "date" ? "default" : "outline"} size="sm" className="h-7 text-xs gap-1" onClick={() => setViewMode("date")}>
              <Grid3X3 className="h-3 w-3" /> Por Data
            </Button>
            <Button variant={viewMode === "category" ? "default" : "outline"} size="sm" className="h-7 text-xs gap-1" onClick={() => setViewMode("category")}>
              <List className="h-3 w-3" /> Por Tipo
            </Button>
            <Button variant={viewMode === "timeline" ? "default" : "outline"} size="sm" className="h-7 text-xs gap-1" onClick={() => setViewMode("timeline")}>
              <Clock className="h-3 w-3" /> Timeline
            </Button>
            <Button variant={viewMode === "compare" ? "default" : "outline"} size="sm" className="h-7 text-xs gap-1" onClick={() => setViewMode("compare")}>
              <Columns className="h-3 w-3" /> Comparar
              {compareItems.length > 0 && <Badge className="text-[9px] h-4 px-1 ml-0.5">{compareItems.length}</Badge>}
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-3 w-3" /> Filtros
              {(filterCategory !== "all" || filterStatus !== "all" || filterLaterality !== "all" || filterFileType !== "all" || searchTerm) && (
                <Badge className="text-[9px] h-4 px-1 bg-primary text-primary-foreground">!</Badge>
              )}
            </Button>
          </div>
        </div>

        {renderFilters()}

        {/* Active filter chips */}
        {(filterCategory !== "all" || filterStatus !== "all" || filterLaterality !== "all" || filterFileType !== "all" || searchTerm) && (
          <div className="flex flex-wrap gap-1 mt-2">
            {filterCategory !== "all" && <Badge variant="secondary" className="text-[9px] gap-1">{filterCategory} <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setFilterCategory("all")} /></Badge>}
            {filterStatus !== "all" && <Badge variant="secondary" className="text-[9px] gap-1">{filterStatus} <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setFilterStatus("all")} /></Badge>}
            {filterLaterality !== "all" && <Badge variant="secondary" className="text-[9px] gap-1">{filterLaterality} <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setFilterLaterality("all")} /></Badge>}
            {filterFileType !== "all" && <Badge variant="secondary" className="text-[9px] gap-1">{filterFileType} <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setFilterFileType("all")} /></Badge>}
            {searchTerm && <Badge variant="secondary" className="text-[9px] gap-1">"{searchTerm}" <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setSearchTerm("")} /></Badge>}
            <Button variant="ghost" size="sm" className="h-5 text-[9px] px-1" onClick={() => { setFilterCategory("all"); setFilterStatus("all"); setFilterLaterality("all"); setFilterFileType("all"); setSearchTerm(""); }}>Limpar filtros</Button>
          </div>
        )}

        {/* Content */}
        <div className="mt-4">
          {viewMode === "date" && renderDateView()}
          {viewMode === "category" && renderCategoryView()}
          {viewMode === "timeline" && renderTimeline()}
          {viewMode === "compare" && renderCompareView()}
        </div>
      </ModuleSection>

      {renderViewer()}
      <UploadDialog />
    </div>
  );
}

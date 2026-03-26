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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Image, Upload, Grid3X3, List, Clock, Columns, Filter, X, ZoomIn, ZoomOut,
  Maximize, ChevronLeft, ChevronRight, Play, FileText, Video, Eye, Search,
  Pencil, Circle, Square, ArrowRight, Type, Eraser, Save, Trash2, RotateCcw,
  ChevronDown, ChevronUp, ChevronsDownUp, ChevronsUpDown, Undo2, Redo2,
  Minus, MousePointer,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// ====== MOCK DATA ======
const MOCK_DATA: Omit<ExamGalleryItem, "id" | "created_at" | "updated_at">[] = [
  { patient_id: "", exam_date: "2026-03-26", title: "Retinografia OD", category: "Retinografia", laterality: "OD", file_url: "/placeholder.svg", file_type: "image", file_name: "retinografia_od_1.jpg", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", observations: "Fundo de olho sem alterações", tags: ["oftalmologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-26", title: "Retinografia OE", category: "Retinografia", laterality: "OE", file_url: "/placeholder.svg", file_type: "image", file_name: "retinografia_oe_1.jpg", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-26", title: "Retinografia AO Panorâmica", category: "Retinografia", laterality: "AO", file_url: "/placeholder.svg", file_type: "image", file_name: "retinografia_ao.jpg", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-26", title: "OCT Macular OD", category: "OCT", laterality: "OD", file_url: "/placeholder.svg", file_type: "image", file_name: "oct_od.jpg", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", report_text: "Espessura macular central dentro dos limites normais. Sem edema.", tags: ["oftalmologia", "macula"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-26", title: "OCT Macular OE", category: "OCT", laterality: "OE", file_url: "/placeholder.svg", file_type: "image", file_name: "oct_oe.jpg", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-26", title: "Topografia Corneana OD", category: "Topografia Corneana", laterality: "OD", file_url: "/placeholder.svg", file_type: "image", file_name: "topo_od.jpg", status: "recebido", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia", "cornea"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-26", title: "Topografia Corneana OE", category: "Topografia Corneana", laterality: "OE", file_url: "/placeholder.svg", file_type: "image", file_name: "topo_oe.jpg", status: "recebido", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-26", title: "Vídeo Gonioscopia", category: "Vídeo Clínico", file_url: "/placeholder.svg", file_type: "video", file_name: "gonioscopia.mp4", status: "recebido", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia", "video"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-26", title: "Laudo Oftalmológico Completo", category: "PDF de Laudo", file_url: "/placeholder.svg", file_type: "pdf", file_name: "laudo_oftalmo.pdf", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", report_text: "Exame oftalmológico completo sem alterações significativas.", tags: ["laudo"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-23", title: "Raio-X Tórax PA", category: "Raio-X", file_url: "/placeholder.svg", file_type: "image", file_name: "rx_torax_pa.jpg", status: "laudado", professional_name: "Dra. Carla Souza", origin: "Radiologia", report_text: "Campos pulmonares livres. Área cardíaca dentro da normalidade.", tags: ["radiologia", "torax"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-23", title: "Raio-X Tórax Perfil", category: "Raio-X", file_url: "/placeholder.svg", file_type: "image", file_name: "rx_torax_perfil.jpg", status: "laudado", professional_name: "Dra. Carla Souza", origin: "Radiologia", tags: ["radiologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-03-23", title: "Laudo Raio-X Tórax", category: "PDF de Laudo", file_url: "/placeholder.svg", file_type: "pdf", file_name: "laudo_rx_torax.pdf", status: "laudado", professional_name: "Dra. Carla Souza", origin: "Radiologia", tags: ["laudo"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-02-12", title: "Biometria Ultrassônica OD", category: "Biometria", laterality: "OD", file_url: "/placeholder.svg", file_type: "image", file_name: "biometria_od_1.jpg", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-02-12", title: "Biometria Ultrassônica OE", category: "Biometria", laterality: "OE", file_url: "/placeholder.svg", file_type: "image", file_name: "biometria_oe_1.jpg", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-02-12", title: "Biometria Óptica IOL Master", category: "Biometria", laterality: "AO", file_url: "/placeholder.svg", file_type: "image", file_name: "biometria_iol.jpg", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-02-12", title: "Campimetria OD", category: "Campimetria", laterality: "OD", file_url: "/placeholder.svg", file_type: "image", file_name: "campimetria_od.jpg", status: "recebido", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia", "campo_visual"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-02-12", title: "Campimetria OE", category: "Campimetria", laterality: "OE", file_url: "/placeholder.svg", file_type: "image", file_name: "campimetria_oe.jpg", status: "recebido", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["oftalmologia"], annotations: [], metadata: {} },
  { patient_id: "", exam_date: "2026-02-12", title: "Relatório Biometria", category: "PDF de Laudo", file_url: "/placeholder.svg", file_type: "pdf", file_name: "relatorio_biometria.pdf", status: "laudado", professional_name: "Dr. Lucas Mendes", origin: "Oftalmologia", tags: ["laudo"], annotations: [], metadata: {} },
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
  image: Image, video: Video, pdf: FileText, dicom: Eye,
};

// ====== ANNOTATION TYPES ======
type AnnotationShape = {
  id: string;
  tool: string;
  color: string;
  strokeWidth: number;
  fontSize?: number;
  points: { x: number; y: number }[];
  text?: string;
};

interface ExamGalleryProps {
  patientId: string;
}

export function ExamGallery({ patientId }: ExamGalleryProps) {
  const { data: dbItems = [] } = useExamGallery(patientId);
  const createItem = useCreateExamGalleryItem();
  const updateItem = useUpdateExamGalleryItem();
  const { user } = useAuth();

  const allItems = useMemo(() => {
    const mockWithId = MOCK_DATA.map((m, i) => ({
      ...m, id: `mock-${i}`, patient_id: patientId,
      created_at: `${m.exam_date}T10:00:00Z`, updated_at: `${m.exam_date}T10:00:00Z`,
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
  const [zoom, setZoom] = useState(1);

  // Collapsible state
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

  // Annotation state
  const [annotating, setAnnotating] = useState(false);
  const [annotationTool, setAnnotationTool] = useState<string>("free");
  const [annotationColor, setAnnotationColor] = useState("#ef4444");
  const [annotationStrokeWidth, setAnnotationStrokeWidth] = useState(3);
  const [annotationFontSize, setAnnotationFontSize] = useState(16);
  const [savedAnnotations, setSavedAnnotations] = useState<AnnotationShape[]>([]);
  const [currentAnnotations, setCurrentAnnotations] = useState<AnnotationShape[]>([]);
  const [undoStack, setUndoStack] = useState<AnnotationShape[][]>([]);
  const [redoStack, setRedoStack] = useState<AnnotationShape[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textInput, setTextInput] = useState<{ x: number; y: number } | null>(null);
  const [textValue, setTextValue] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter
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

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, ExamGalleryItem[]> = {};
    filtered.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  // ====== COLLAPSE HELPERS ======
  const toggleDate = (date: string) => {
    setCollapsedDates(prev => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date); else next.add(date);
      return next;
    });
  };
  const expandAll = () => setCollapsedDates(new Set());
  const collapseAll = () => setCollapsedDates(new Set(groupedByDate.map(([d]) => d)));

  // ====== COMPARE ======
  const addToCompare = (item: ExamGalleryItem) => {
    if (compareItems.length >= 3) { toast.info("Máximo de 3 itens"); return; }
    if (compareItems.find(c => c.id === item.id)) { toast.info("Item já adicionado"); return; }
    setCompareItems(prev => [...prev, item]);
    toast.success("Adicionado à comparação");
  };
  const removeFromCompare = (id: string) => setCompareItems(prev => prev.filter(c => c.id !== id));

  // ====== VIEWER ======
  const openViewer = (item: ExamGalleryItem) => {
    setViewerItem(item);
    setZoom(1);
    setAnnotating(false);
    setTextInput(null);
    const existing = (item.annotations as AnnotationShape[] | null) || [];
    setSavedAnnotations(existing);
    setCurrentAnnotations(existing);
    setUndoStack([]);
    setRedoStack([]);
  };

  const navigateViewer = (dir: number) => {
    if (!viewerItem) return;
    const idx = filtered.findIndex(i => i.id === viewerItem.id);
    const next = filtered[idx + dir];
    if (next) openViewer(next);
  };

  // ====== ANNOTATION CANVAS DRAWING ======
  const drawAnnotations = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    currentAnnotations.forEach(shape => {
      ctx.strokeStyle = shape.color;
      ctx.fillStyle = shape.color;
      ctx.lineWidth = shape.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (shape.tool === "free" && shape.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        shape.points.forEach((p, i) => { if (i > 0) ctx.lineTo(p.x, p.y); });
        ctx.stroke();
      } else if (shape.tool === "line" && shape.points.length === 2) {
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        ctx.lineTo(shape.points[1].x, shape.points[1].y);
        ctx.stroke();
      } else if (shape.tool === "arrow" && shape.points.length === 2) {
        const [p1, p2] = shape.points;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const headLen = 12 + shape.strokeWidth * 2;
        ctx.beginPath();
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(p2.x - headLen * Math.cos(angle - Math.PI / 6), p2.y - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(p2.x - headLen * Math.cos(angle + Math.PI / 6), p2.y - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (shape.tool === "circle" && shape.points.length === 2) {
        const [p1, p2] = shape.points;
        const rx = Math.abs(p2.x - p1.x) / 2;
        const ry = Math.abs(p2.y - p1.y) / 2;
        const cx = (p1.x + p2.x) / 2;
        const cy = (p1.y + p2.y) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (shape.tool === "square" && shape.points.length === 2) {
        const [p1, p2] = shape.points;
        ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      } else if (shape.tool === "point" && shape.points.length >= 1) {
        const p = shape.points[0];
        ctx.beginPath();
        ctx.arc(p.x, p.y, shape.strokeWidth * 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (shape.tool === "text" && shape.text && shape.points.length >= 1) {
        ctx.font = `${shape.fontSize || 16}px sans-serif`;
        ctx.fillText(shape.text, shape.points[0].x, shape.points[0].y);
      }
    });
  }, [currentAnnotations]);

  useEffect(() => {
    if (annotating) drawAnnotations();
  }, [annotating, currentAnnotations, drawAnnotations]);

  // Resize observer for canvas
  useEffect(() => {
    if (!annotating || !containerRef.current) return;
    const obs = new ResizeObserver(() => drawAnnotations());
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [annotating, drawAnnotations]);

  const getCanvasPos = (e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const pushUndo = () => {
    setUndoStack(prev => [...prev, currentAnnotations]);
    setRedoStack([]);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!annotating) return;
    const pos = getCanvasPos(e);

    if (annotationTool === "text") {
      setTextInput(pos);
      setTextValue("");
      return;
    }

    if (annotationTool === "point") {
      pushUndo();
      const shape: AnnotationShape = {
        id: crypto.randomUUID(), tool: "point", color: annotationColor,
        strokeWidth: annotationStrokeWidth, points: [pos],
      };
      setCurrentAnnotations(prev => [...prev, shape]);
      return;
    }

    setIsDrawing(true);
    pushUndo();
    const shape: AnnotationShape = {
      id: crypto.randomUUID(), tool: annotationTool, color: annotationColor,
      strokeWidth: annotationStrokeWidth, fontSize: annotationFontSize, points: [pos],
    };
    setCurrentAnnotations(prev => [...prev, shape]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !annotating) return;
    const pos = getCanvasPos(e);
    setCurrentAnnotations(prev => {
      const updated = [...prev];
      const last = { ...updated[updated.length - 1] };
      if (last.tool === "free") {
        last.points = [...last.points, pos];
      } else {
        last.points = [last.points[0], pos];
      }
      updated[updated.length - 1] = last;
      return updated;
    });
  };

  const handleCanvasMouseUp = () => { setIsDrawing(false); };

  const confirmText = () => {
    if (!textInput || !textValue.trim()) { setTextInput(null); return; }
    pushUndo();
    const shape: AnnotationShape = {
      id: crypto.randomUUID(), tool: "text", color: annotationColor,
      strokeWidth: annotationStrokeWidth, fontSize: annotationFontSize,
      points: [textInput], text: textValue,
    };
    setCurrentAnnotations(prev => [...prev, shape]);
    setTextInput(null);
    setTextValue("");
  };

  const undoAnnotation = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(rs => [...rs, currentAnnotations]);
    setCurrentAnnotations(prev);
    setUndoStack(us => us.slice(0, -1));
  };

  const redoAnnotation = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(us => [...us, currentAnnotations]);
    setCurrentAnnotations(next);
    setRedoStack(rs => rs.slice(0, -1));
  };

  const clearAnnotations = () => {
    pushUndo();
    setCurrentAnnotations([]);
  };

  const saveAnnotations = () => {
    if (!viewerItem) return;
    setSavedAnnotations(currentAnnotations);
    if (!viewerItem.id.startsWith("mock-")) {
      updateItem.mutate({ id: viewerItem.id, annotations: currentAnnotations as any });
    }
    toast.success("Anotações salvas com sucesso");
  };

  const cancelAnnotations = () => {
    setCurrentAnnotations(savedAnnotations);
    setAnnotating(false);
    setTextInput(null);
  };

  // ====== UPLOAD ======
  const handleUpload = async (files: FileList, meta: { title: string; category: string; examDate: string; laterality?: string; observations?: string }) => {
    for (const file of Array.from(files)) {
      try {
        const url = await uploadExamFile(file, patientId);
        const fileType = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : file.type === "application/pdf" ? "pdf" : "image";
        await createItem.mutateAsync({
          patient_id: patientId, title: meta.title || file.name, category: meta.category || "Outros",
          exam_date: meta.examDate || new Date().toISOString().split("T")[0],
          laterality: meta.laterality || null, file_url: url, file_type: fileType,
          file_name: file.name, file_size: file.size, mime_type: file.type,
          status: "recebido", observations: meta.observations || null,
          uploaded_by: user?.id || null, annotations: [], metadata: {}, tags: [],
        });
      } catch { toast.error(`Erro ao enviar ${file.name}`); }
    }
    setShowUpload(false);
  };

  const FileTypeIcon = ({ type }: { type: string }) => {
    const Icon = FILE_TYPE_ICON[type] || Image;
    return <Icon className="h-4 w-4" />;
  };

  // ====== RENDER HELPERS ======
  const renderThumbnail = (item: ExamGalleryItem, size: "sm" | "md" = "sm") => {
    const sizeClass = size === "md" ? "w-24 h-24" : "w-16 h-16";
    const isPlaceholder = item.file_url === "/placeholder.svg";
    return (
      <div className={`${sizeClass} rounded-lg overflow-hidden bg-muted/50 border border-border flex items-center justify-center relative group cursor-pointer`} onClick={() => openViewer(item)}>
        {item.file_type === "image" ? (
          isPlaceholder ? (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center"><Image className="h-6 w-6 text-muted-foreground/50" /></div>
          ) : <img src={item.file_url} alt={item.title} className="w-full h-full object-cover" />
        ) : item.file_type === "video" ? (
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-950/30 flex items-center justify-center"><Play className="h-6 w-6 text-purple-600 dark:text-purple-400" /></div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-950/30 flex items-center justify-center"><FileText className="h-6 w-6 text-red-600 dark:text-red-400" /></div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {item.laterality && <Badge className="absolute top-0.5 right-0.5 text-[8px] px-1 h-4 bg-primary/80 text-primary-foreground">{item.laterality}</Badge>}
      </div>
    );
  };

  const renderFilters = () => (
    <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 p-3 bg-muted/30 rounded-lg border border-border ${showFilters ? "" : "hidden"}`}>
      <div>
        <Label className="text-[10px]">Categoria</Label>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{[<SelectItem key="all" value="all">Todas</SelectItem>, ...CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)]}</SelectContent>
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

  // ====== DATE VIEW WITH COLLAPSE ======
  const renderDateView = () => (
    <div className="space-y-4">
      {/* Expand/Collapse All */}
      {groupedByDate.length > 0 && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={expandAll}>
            <ChevronsUpDown className="h-3 w-3" /> Expandir Tudo
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={collapseAll}>
            <ChevronsDownUp className="h-3 w-3" /> Recolher Tudo
          </Button>
        </div>
      )}

      {groupedByDate.map(([date, categories]) => {
        const isCollapsed = collapsedDates.has(date);
        const totalFiles = Object.values(categories).flat().length;
        const totalExams = Object.keys(categories).length;

        return (
          <div key={date} className="space-y-2">
            {/* Date header - clickable */}
            <button
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
              onClick={() => toggleDate(date)}
            >
              <div className={`transition-transform duration-200 ${isCollapsed ? "" : "rotate-180"}`}>
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
              <h3 className="text-sm font-semibold text-foreground">
                {format(parseISO(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </h3>
              <Badge variant="secondary" className="text-[10px] h-5">
                {totalFiles} {totalFiles === 1 ? "arquivo" : "arquivos"} • {totalExams} {totalExams === 1 ? "exame" : "exames"}
              </Badge>
              {isCollapsed && (
                <div className="flex gap-1 ml-auto">
                  {Object.keys(categories).slice(0, 3).map(cat => (
                    <Badge key={cat} variant="outline" className="text-[9px] h-4">{cat}</Badge>
                  ))}
                  {Object.keys(categories).length > 3 && (
                    <Badge variant="outline" className="text-[9px] h-4">+{Object.keys(categories).length - 3}</Badge>
                  )}
                </div>
              )}
            </button>

            {/* Expandable content */}
            {!isCollapsed && (
              <div className="ml-6 space-y-3">
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
                          <Button variant="ghost" size="sm" className="h-5 text-[9px] px-1" onClick={(e) => { e.stopPropagation(); addToCompare(item); }}>+ Comparar</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {groupedByDate.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Image className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Nenhum exame encontrado</p>
          <p className="text-xs mt-1">Ajuste os filtros ou faça upload de novos arquivos</p>
          <Button size="sm" className="mt-3" onClick={() => setShowUpload(true)}><Upload className="h-3.5 w-3.5 mr-1" /> Upload</Button>
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
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setCompareItems([])}><Trash2 className="h-3 w-3 mr-1" /> Limpar</Button>
          </div>
          <div className={`grid gap-3 ${compareItems.length === 1 ? "grid-cols-1" : compareItems.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {compareItems.map(item => (
              <div key={item.id} className="medical-card p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{item.category} • {format(parseISO(item.exam_date), "dd/MM/yyyy")}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeFromCompare(item.id)}><X className="h-3 w-3" /></Button>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden bg-muted/50 border flex items-center justify-center cursor-pointer" onClick={() => openViewer(item)}>
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
        </>
      )}
    </div>
  );

  // ====== VIEWER DIALOG ======
  const renderViewer = () => {
    if (!viewerItem) return null;
    const ANNOTATION_TOOLS = [
      { id: "free", icon: Pencil, label: "Caneta" },
      { id: "line", icon: Minus, label: "Linha" },
      { id: "arrow", icon: ArrowRight, label: "Seta" },
      { id: "circle", icon: Circle, label: "Círculo" },
      { id: "square", icon: Square, label: "Retângulo" },
      { id: "point", icon: MousePointer, label: "Ponto" },
      { id: "text", icon: Type, label: "Texto" },
    ];
    const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#ffffff", "#000000"];

    return (
      <Dialog open={!!viewerItem} onOpenChange={() => { setViewerItem(null); setAnnotating(false); setTextInput(null); }}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <div>
              <p className="text-sm font-semibold">{viewerItem.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {viewerItem.category} • {format(parseISO(viewerItem.exam_date), "dd/MM/yyyy")}
                {viewerItem.laterality ? ` • ${viewerItem.laterality}` : ""}
                {viewerItem.professional_name ? ` • ${viewerItem.professional_name}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Badge className={`text-[9px] ${STATUS_COLORS[viewerItem.status] || ""}`}>{viewerItem.status}</Badge>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigateViewer(-1)}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigateViewer(1)}><ChevronRight className="h-4 w-4" /></Button>
              {!annotating && (
                <>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}><ZoomOut className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.min(3, z + 0.25))}><ZoomIn className="h-4 w-4" /></Button>
                </>
              )}
              <Button
                variant={annotating ? "default" : "ghost"} size="sm"
                className={`h-7 px-2 text-xs gap-1 ${annotating ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => {
                  if (annotating) { cancelAnnotations(); } else { setAnnotating(true); }
                }}
              >
                <Pencil className="h-3.5 w-3.5" /> {annotating ? "Sair" : "Anotar"}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => addToCompare(viewerItem)}>
                <Columns className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Annotation mode banner */}
          {annotating && (
            <div className="px-3 py-1.5 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-primary">Modo Anotação Ativo</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={saveAnnotations}>
                  <Save className="h-3 w-3" /> Salvar
                </Button>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={cancelAnnotations}>
                  <X className="h-3 w-3" /> Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Annotation toolbar - left side */}
            {annotating && (
              <div className="w-12 border-r flex flex-col items-center py-2 gap-1 bg-muted/30 overflow-y-auto">
                {/* Tools */}
                {ANNOTATION_TOOLS.map(t => (
                  <Button
                    key={t.id} title={t.label}
                    variant={annotationTool === t.id ? "default" : "ghost"}
                    size="sm" className="h-8 w-8 p-0"
                    onClick={() => setAnnotationTool(t.id)}
                  >
                    <t.icon className="h-3.5 w-3.5" />
                  </Button>
                ))}
                <div className="border-t w-8 my-1" />
                {/* Colors */}
                <div className="flex flex-col gap-1">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      className={`w-5 h-5 rounded-full border-2 mx-auto ${annotationColor === c ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setAnnotationColor(c)}
                    />
                  ))}
                </div>
                <div className="border-t w-8 my-1" />
                {/* Stroke width */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[8px] text-muted-foreground">Traço</span>
                  {[1, 2, 3, 5, 8].map(w => (
                    <button
                      key={w}
                      className={`w-8 flex items-center justify-center py-0.5 rounded ${annotationStrokeWidth === w ? "bg-primary/20" : "hover:bg-muted"}`}
                      onClick={() => setAnnotationStrokeWidth(w)}
                    >
                      <div className="rounded-full bg-foreground" style={{ width: `${w * 3 + 4}px`, height: `${Math.min(w, 4)}px` }} />
                    </button>
                  ))}
                </div>
                {annotationTool === "text" && (
                  <>
                    <div className="border-t w-8 my-1" />
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[8px] text-muted-foreground">Fonte</span>
                      {[12, 16, 20, 28].map(s => (
                        <button
                          key={s}
                          className={`w-8 h-6 text-[9px] rounded ${annotationFontSize === s ? "bg-primary/20 font-bold" : "hover:bg-muted"}`}
                          onClick={() => setAnnotationFontSize(s)}
                        >{s}</button>
                      ))}
                    </div>
                  </>
                )}
                <div className="border-t w-8 my-1" />
                {/* Undo/Redo/Clear */}
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Desfazer" onClick={undoAnnotation} disabled={undoStack.length === 0}>
                  <Undo2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Refazer" onClick={redoAnnotation} disabled={redoStack.length === 0}>
                  <Redo2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" title="Limpar tudo" onClick={clearAnnotations}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* Main viewer */}
            <div className="flex-1 relative overflow-auto bg-black/5 dark:bg-black/30 flex items-center justify-center">
              {viewerItem.file_type === "image" ? (
                <div
                  ref={containerRef}
                  style={{ transform: annotating ? undefined : `scale(${zoom})`, transition: "transform 0.2s" }}
                  className="relative"
                >
                  {viewerItem.file_url === "/placeholder.svg" ? (
                    <div className="w-96 h-96 bg-gradient-to-br from-muted to-muted/30 rounded-lg flex items-center justify-center">
                      <Image className="h-24 w-24 text-muted-foreground/20" />
                    </div>
                  ) : (
                    <img src={viewerItem.file_url} alt={viewerItem.title} className="max-w-full max-h-full object-contain" />
                  )}
                  {/* Canvas overlay for annotations */}
                  {annotating && (
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full cursor-crosshair"
                      style={{ touchAction: "none" }}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                    />
                  )}
                  {/* Text input overlay */}
                  {annotating && textInput && (
                    <div
                      className="absolute z-10"
                      style={{ left: textInput.x, top: textInput.y }}
                    >
                      <div className="flex gap-1 items-center bg-background border border-primary rounded shadow-lg p-1">
                        <input
                          autoFocus
                          className="text-xs border-0 outline-none bg-transparent w-40 px-1"
                          style={{ color: annotationColor, fontSize: annotationFontSize }}
                          placeholder="Digite o texto..."
                          value={textValue}
                          onChange={e => setTextValue(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") confirmText(); if (e.key === "Escape") setTextInput(null); }}
                        />
                        <Button size="sm" className="h-5 w-5 p-0" onClick={confirmText}><Save className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => setTextInput(null)}><X className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : viewerItem.file_type === "video" ? (
                <div className="w-full max-w-2xl p-4">
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    {viewerItem.file_url !== "/placeholder.svg" ? (
                      <video src={viewerItem.file_url} controls className="w-full h-full rounded-lg" />
                    ) : (
                      <div className="text-center"><Play className="h-16 w-16 text-white/50 mx-auto mb-2" /><p className="text-white/50 text-sm">{viewerItem.file_name}</p></div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-2xl p-4">
                  {viewerItem.file_url !== "/placeholder.svg" ? (
                    <iframe src={viewerItem.file_url} className="w-full h-full rounded-lg border" />
                  ) : (
                    <div className="aspect-[3/4] bg-white dark:bg-muted rounded-lg flex items-center justify-center border">
                      <div className="text-center"><FileText className="h-16 w-16 text-red-300 mx-auto mb-2" /><p className="text-muted-foreground text-sm">{viewerItem.file_name}</p></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Side panel - report */}
            {viewerItem.report_text && !annotating && (
              <div className="w-64 border-l p-3 overflow-auto bg-background">
                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Laudo</h4>
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

  // ====== UPLOAD DIALOG ======
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
              onDragOver={e => e.preventDefault()} onDrop={onDrop}
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
                    <SelectItem value="OD">OD</SelectItem>
                    <SelectItem value="OE">OE</SelectItem>
                    <SelectItem value="AO">AO</SelectItem>
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

  // ====== MAIN RENDER ======
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

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText } from 'lucide-react';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';

interface DocumentsTabProps {
  caseId?: string;
  clientId?: string;
  petitionId?: string;
}

const DocumentsTab = ({ caseId, clientId, petitionId }: DocumentsTabProps) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documentos
        </CardTitle>
        <CardDescription>
          Gerencie os documentos relacionados a este registro
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="gap-2">
              <FileText className="w-4 h-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-4">
            <DocumentList
              caseId={caseId}
              clientId={clientId}
              petitionId={petitionId}
              refreshTrigger={refreshTrigger}
            />
          </TabsContent>
          <TabsContent value="upload" className="mt-4">
            <DocumentUpload
              caseId={caseId}
              clientId={clientId}
              petitionId={petitionId}
              onUploadComplete={handleUploadComplete}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentsTab;

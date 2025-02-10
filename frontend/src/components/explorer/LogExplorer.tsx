import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Save,
  Download,
  Layers,
  RefreshCw,
  Wand2,
  Settings2,
  FolderTree,
} from 'lucide-react';
import axios from 'axios';
import ReactJson from 'react-json-view'
import { JsonView, allExpanded, darkStyles, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

const LogExplorer = () => {
  const [view, setView] = useState('table');
  const [searchText, setSearchText] = useState('');
  const [searchTexts, setSearchTexts] = useState([]);
  const [logResult, setLogResult] = useState({ logs: [] });


  const handleSearchText = (e) => {
    setSearchTexts([...searchTexts, e.target.value]);
  }


  useEffect(() => {
    axios.get('http://localhost:8080/v1/logs')
      .then((response) => {
        setLogResult(response.data);
        console.log('responseData', response.data);
    })
    .catch((error) => {
      console.log(error);
    });
  }, [])


  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Log Explorer</h1>
          <p className="text-muted-foreground">
            Advanced log analysis and visualization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Save Query
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Query Builder */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Query Builder</CardTitle>
              <CardDescription>
                Build complex queries with advanced filters
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select defaultValue="15m">
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15m">Last 15m</SelectItem>
                  <SelectItem value="1h">Last 1h</SelectItem>
                  <SelectItem value="6h">Last 6h</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7d</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <Select defaultValue="user">
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="user">User Service</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="Info">
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Info">Info</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                  <SelectItem value="Error">Error</SelectItem>
                  <SelectItem value="Debug">Debug</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1">
                <Input
                  placeholder="Text to find.."
                  className="w-full"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchText(e);
                      setSearchText('');
                    }
                  }}
                />
              </div>
              <Button className="gap-2">
                <Search className="h-4 w-4" onClick={handleSearchText} />
                Search
              </Button>
            </div>

            {/* Filter Tags */}

            <div className="flex flex-wrap gap-2">
            {searchTexts.map((text, index) => (
              <Badge variant="outline" className="gap-2">
                {text}
                <button className="ml-1">&times;</button>
              </Badge>
            ))}
            </div>
           
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="">
        <div className="col-span-3 space-y-6">
          <Card>
            <CardContent className="py-3">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant={view === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setView('table')}
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    Table
                  </Button>
                  <Button
                    variant={view === 'json' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setView('json')}
                  >
                    <FolderTree className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings2 className="h-4 w-4 mr-2" />
                    Columns
                  </Button>
                  <Button variant="outline" size="sm">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Auto-format
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Log Content */}
          <Card>
          {logResult?.logs?.map(log => (
            <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Document</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>2024-01-01 12:00:01</TableCell>
                      <TableCell><pre className="whitespace-pre-wrap break-words">{`${JSON.stringify(JSON.parse(log?.log), null, 2)}`}</pre></TableCell>
                      {/* <TableCell><JsonView data={JSON.parse(log?.log)} shouldExpandNode={allExpanded} style={defaultStyles} /></TableCell> */}
                    </TableRow>
                  </TableBody>
                </Table>
            </CardContent>
        ))}
          </Card>
        </div>
      </div>
      </div>
  );
};

export default LogExplorer;

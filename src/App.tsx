/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-inner-declarations */
import './App.css'
import { useEffect, useState } from 'react';
import { MdFormatColorText } from "react-icons/md";
import { LuPencilLine, LuSave } from "react-icons/lu";
import { CiText } from "react-icons/ci";
import { PiHighlighterDuotone } from "react-icons/pi";


function App() {

  const [color, setColor] = useState('');
  const [textOptions, setTextOptions] = useState<textOptions>({ size: "16", font: "Arial", bgColor: null })
  const [annotate, setAnnotate] = useState<AnnotateState>({ highlighter: false, draw: false, text: false, marker: false });
  const defaultAnnotate: AnnotateState = { highlighter: false, draw: false, text: false, marker: false }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ScriptArgs = any[];
  interface StateData {
    sessionColor: string;
    annotate: AnnotateState;
  }
  interface AnnotateState {
    highlighter: boolean;
    draw: boolean;
    text: boolean;
    marker: boolean;
  }
  interface textOptions {
    font: string,
    size: string,
    bgColor: string | null
  }

  async (annotate: AnnotateState): Promise<void> => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
      throw new Error('Unable to get tab ID');
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [annotate],
      func: (annotate: AnnotateState) => {
        sessionStorage.setItem('annotate', JSON.stringify(annotate));
        console.log(annotate);
      }
    });
  };

  const saveHandler = async (): Promise<void> => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
      throw new Error('Unable to get tab ID');
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [],
      func: () => {
        function saveAsHTML() {
          const htmlContent = document.documentElement.outerHTML;
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const url = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = 'annotated_page.html';
          link.click();

          URL.revokeObjectURL(url);
        }
        saveAsHTML();
        console.log(color)

      }
    });
  };


  const getState = async (): Promise<StateData> => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
      throw new Error('Unable to get tab ID');
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [],
      func: (): StateData => {
        const sessionColor = sessionStorage.getItem('color') || 'Tomato';
        const annotate = JSON.parse(sessionStorage.getItem('annotate') || '{"highlighter": false, "draw": false, "text": false, "marker": false}');
        return { sessionColor, annotate };
      }
    });


    if (results && results.length > 0 && results[0].result !== undefined) {
      const result = results[0].result;
      console.log('Script result:', result);
      return result;
    }

    return { sessionColor: '', annotate: { highlighter: false, draw: false, text: false, marker: false } };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setSessiontAnnotate = async (annotate: AnnotateState): Promise<void> => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
      throw new Error('Unable to get tab ID');
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [annotate],
      func: (annotate: AnnotateState) => {
        sessionStorage.setItem('annotate', JSON.stringify(annotate));
        console.log(annotate);
      }
    });
  };

  const setSessionColor = async (color: string): Promise<void> => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
      throw new Error('Unable to get tab ID');
    }

    await chrome.scripting.executeScript<string[], void>({
      target: { tabId: tab.id },
      args: [color],
      func: (color: string) => {
        sessionStorage.setItem('color', color);
        console.log(color)

      }
    });
  };

  const setSessiontOptions = async (options: textOptions): Promise<void> => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
      throw new Error('Unable to get tab ID');
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [options],
      func: (options: textOptions) => {
        sessionStorage.setItem('options', JSON.stringify(options));
        console.log(options, "hey check at session");
      }
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const TextHiglighter = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id as number },
      args: [],
      func: () => {

        const annotate: AnnotateState = JSON.parse(sessionStorage.getItem("annotate") as string)
        console.log(annotate.highlighter);

        function handleMouseUp() {

          const annotate: AnnotateState = JSON.parse(sessionStorage.getItem("annotate") as string)
          console.log(annotate.highlighter);

          const selection = window.getSelection();
          if (annotate.highlighter == false) {
            console.log("done")
            document.removeEventListener("mouseup", handleMouseUp);
          }
          if (selection && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.style.backgroundColor = sessionStorage.getItem('color') as string; // Set highlight color
            range.surroundContents(span);
          }
        }
        if (annotate.highlighter) {
          document.addEventListener("mouseup", handleMouseUp);
        }

      }
    });
  };

  const DrawingPen = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id as number },
      args: [],
      func: () => {
        const canvasId = 'drawingCanvas';
        let isDrawing = false;

        //const annotate: AnnotateState = JSON.parse(sessionStorage.getItem("annotate") as string);
        //console.log(annotate.highlighter);

        const startDrawing = (ctx: CanvasRenderingContext2D, e: MouseEvent) => {
          isDrawing = true;
          ctx.beginPath();
          ctx.moveTo(e.clientX, e.clientY);
        };

        const draw = (ctx: CanvasRenderingContext2D, e: MouseEvent) => {
          if (!isDrawing) return;
          ctx.lineTo(e.clientX, e.clientY);
          ctx.stroke();
        };

        const stopDrawing = (ctx: CanvasRenderingContext2D) => {
          isDrawing = false;
          ctx.closePath();
        };

        const canvas = document.getElementById(canvasId) as HTMLCanvasElement || document.createElement('canvas');
        if (!document.getElementById(canvasId)) {
          canvas.id = canvasId;
          canvas.style.position = 'absolute';
          canvas.style.top = '0';
          canvas.style.left = '0';
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          canvas.style.zIndex = '9999';
          document.body.appendChild(canvas);
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = sessionStorage.getItem('color') as string;
          ctx.lineWidth = 2;

          const handleMouseDown = (e: MouseEvent) => {
            const annotate: AnnotateState = JSON.parse(sessionStorage.getItem("annotate") as string);
            if (annotate.draw) {
              startDrawing(ctx, e);
            }
          };
          const handleMouseMove = (e: MouseEvent) => {
            const annotate: AnnotateState = JSON.parse(sessionStorage.getItem("annotate") as string);
            if (annotate.draw) {
              draw(ctx, e);
            }
          };
          const handleMouseUp = () => {
            const annotate: AnnotateState = JSON.parse(sessionStorage.getItem("annotate") as string);
            if (annotate.draw) {
              stopDrawing(ctx);
            }
          };

          const updateEventListeners = () => {
            const annotate: AnnotateState = JSON.parse(sessionStorage.getItem("annotate") as string);
            if (annotate.draw) {
              canvas.style.pointerEvents = 'auto';
              canvas.addEventListener('mousedown', handleMouseDown);
              canvas.addEventListener('mousemove', handleMouseMove);
              canvas.addEventListener('mouseup', handleMouseUp);
            } else {
              canvas.style.pointerEvents = 'none';
              canvas.removeEventListener('mousedown', handleMouseDown);
              canvas.removeEventListener('mousemove', handleMouseMove);
              canvas.removeEventListener('mouseup', handleMouseUp);
            }
          };

          updateEventListeners();
          window.addEventListener('storage', updateEventListeners);
        }
      }
    });
  };

  const DrawingMarker = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id as number },
      args: [],
      func: () => {
        const canvasId = 'drawingCanvasMarker';
        let isDrawing = false;

        //const annotate: AnnotateState = JSON.parse(sessionStorage.getItem("annotate") as string);
        //console.log(annotate.highlighter);

        const startDrawing = (ctx: CanvasRenderingContext2D, e: MouseEvent) => {
          ctx.globalCompositeOperation = 'destination-over';
          isDrawing = true;
          ctx.beginPath();
          ctx.moveTo(e.clientX, e.clientY);
        };

        const draw = (ctx: CanvasRenderingContext2D, e: MouseEvent) => {
          if (!isDrawing) return;
          ctx.lineTo(e.clientX, e.clientY);
          ctx.stroke();
        };

        const stopDrawing = (ctx: CanvasRenderingContext2D) => {
          isDrawing = false;
          ctx.closePath();
        };

        const canvas = document.getElementById(canvasId) as HTMLCanvasElement || document.createElement('canvas');
        if (!document.getElementById(canvasId)) {
          canvas.id = canvasId;
          canvas.style.position = 'absolute';
          canvas.style.top = '0';
          canvas.style.left = '0';
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          canvas.style.zIndex = '0';
          //  canvas.style.cursor = "./../public/marker.png"
          document.body.appendChild(canvas);
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = sessionStorage.getItem('color') as string;
          ctx.lineWidth = 12;

          const textElements: NodeListOf<HTMLElement> = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');

          textElements.forEach(element => {
            element.style.zIndex = '9999';
          });

          const handleMouseDown = (e: MouseEvent) => {
            const annotate: AnnotateState = JSON.parse(sessionStorage.getItem("annotate") as string);
            if (annotate.marker) {
              startDrawing(ctx, e);
            }
          };
          const handleMouseMove = (e: MouseEvent) => {
            const annotate: AnnotateState = JSON.parse(sessionStorage.getItem("annotate") as string);
            if (annotate.marker) {
              draw(ctx, e);
            }
          };
          const handleMouseUp = () => {
            const annotate: AnnotateState = JSON.parse(sessionStorage.getItem("annotate") as string);
            if (annotate.marker) {
              stopDrawing(ctx);
            }
          };

          const updateEventListeners = () => {
            const annotate: AnnotateState = JSON.parse(sessionStorage.getItem("annotate") as string);
            if (annotate.marker) {
              canvas.style.pointerEvents = 'auto';
              canvas.addEventListener('mousedown', handleMouseDown);
              canvas.addEventListener('mousemove', handleMouseMove);
              canvas.addEventListener('mouseup', handleMouseUp);
            } else {
              canvas.style.pointerEvents = 'none';
              canvas.removeEventListener('mousedown', handleMouseDown);
              canvas.removeEventListener('mousemove', handleMouseMove);
              canvas.removeEventListener('mouseup', handleMouseUp);
            }
          };

          updateEventListeners();
          window.addEventListener('storage', updateEventListeners);
        }
      }
    });
  };


  const addTextAnnotation = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript<ScriptArgs, void>({
      target: { tabId: tab.id as number },
      args: [],
      func: () => {

        const annotate: AnnotateState = JSON.parse(sessionStorage.getItem("annotate") as string)
        const color = sessionStorage.getItem('color') as string
        const options: textOptions = JSON.parse(sessionStorage.getItem('options') as string)

        console.log(options, 'hey check');

        const textBoxIdPrefix = 'textbox';
        let textBoxCount = 0;
        let isDraggable = false;

        const handleMouseClick = (e: MouseEvent) => {
          const annotate: AnnotateState = JSON.parse(sessionStorage.getItem("annotate") as string)


          if (annotate.text == false) {

            document.removeEventListener('mousedown', handleMouseClick)
          } else {
            const textBox = document.createElement('div');
            textBox.id = `${textBoxIdPrefix}${textBoxCount++}`;
            textBox.contentEditable = 'true';
            textBox.style.position = 'absolute';
            textBox.style.minWidth = '30px';
            textBox.style.minHeight = '20px';
            textBox.style.border = 'none';
            //  textBox.style.borderRadius = '10px'
            textBox.style.padding = '5px';
            textBox.style.backgroundColor = 'none';
            textBox.style.color = color;
            textBox.style.zIndex = '10';
            textBox.style.fontSize = `${options.size}px`;
            textBox.style.fontFamily = options.font
            textBox.style.top = `${e.clientY}px`;
            textBox.style.left = `${e.clientX}px`;
            textBox.style.whiteSpace = 'pre-wrap';
            textBox.style.overflow = 'hidden';
            document.body.appendChild(textBox);

            textBox.addEventListener('input', () => {
              textBox.style.width = `${textBox.offsetWidth + 1 + Number(textBox.style.fontSize) / 2}px`;
              //textBox.style.height = `${textBox.scrollHeight}px`;
            });

            textBox.addEventListener('mouseover', () => {
              textBox.style.cursor = 'pointer';
            });

            const handleMouseDown = (e: MouseEvent) => {
              e.preventDefault();
              isDraggable = true;

              const handleMouseMove = (e: MouseEvent) => {
                if (isDraggable) {
                  textBox.style.left = `${e.clientX}px`;
                  textBox.style.top = `${e.clientY}px`;
                }
              };

              const handleMouseUp = () => {
                isDraggable = false;
                textBox.style.cursor = '';
                textBox.focus();
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            };

            textBox.addEventListener("mousedown", handleMouseDown)

            textBox.focus();
          }
        };

        if (annotate.text) {
          document.addEventListener('mousedown', handleMouseClick);
        }

      }
    });
  };



  useEffect(() => {
    getState().then(result => {
      setColor(result.sessionColor);
      setSessiontOptions(textOptions);
      setAnnotate(result.annotate);
    })


  }, [])

  useEffect(() => {

    const updateSessionStorage = () => {
      setSessionColor(color);
      setSessiontAnnotate(annotate);
      setSessiontOptions(textOptions)
    };

    const annotationHandler = async () => {

      await TextHiglighter();
      await DrawingPen();
      await addTextAnnotation()
      await DrawingMarker();
    };

    updateSessionStorage();
    annotationHandler();
    console.log(textOptions)

  }, [color, annotate, textOptions]);

  return (
    <>
      <div className='flex flex-col h-auto gap-4 w-[150px] p-2 pt-0 '>
        <div className='flex flex-col space-y-3 items-center justify-center'>
          <h1 className='text-2xl pl-3 pr-3  font-semibold rounded-xl bg-slate-700 shadow-slate-700 shadow-lg'> Saphire</h1>
          <h2 className='text-lg mt-2'> Make annotations</h2>
        </div>
        <div className='flex gap-2 '>
          <div className={`h-5 w-5 bg-[Tomato] rounded-lg cursor-pointer ${color == 'Tomato' ? 'outline outline-2 outline-slate-50' : ''}`} onClick={() => { setColor("Tomato") }}></div>
          <div className={`h-5 w-5 bg-[Gold] rounded-lg cursor-pointer ${color == 'Gold' ? 'outline outline-2 outline-slate-50' : ''}`} onClick={() => { setColor("Gold") }}></div>
          <div className={`h-5 w-5 bg-[PowderBlue] rounded-lg cursor-pointer ${color == 'PowderBlue' ? 'outline outline-2 outline-slate-50' : ''}`} onClick={() => { setColor("PowderBlue") }}></div>
          <div className={`h-5 w-5 bg-[WhiteSmoke] rounded-lg cursor-pointer ${color == 'WhiteSmoke' ? 'outline outline-2 outline-slate-50' : ''}`} onClick={() => { setColor("WhiteSmoke") }}></div>
          <div className={`h-5 w-5 bg-[Grey] rounded-lg cursor-pointer ${color == 'Grey' ? 'outline outline-2 outline-slate-50' : ''}`} onClick={() => { setColor("Grey") }}></div>
        </div>
        <div className='flex gap-2 '>
          <div className={`h-5 w-5 bg-[BlanchedAlmond] rounded-lg cursor-pointer ${color == 'BlanchedAlmond' ? 'outline outline-2 outline-slate-50' : ''}`} onClick={() => { setColor("BlanchedAlmond") }}></div>
          <div className={`h-5 w-5 bg-[HotPink] rounded-lg cursor-pointer ${color == 'HotPink' ? 'outline outline-2 outline-slate-50' : ''}`} onClick={() => { setColor("HotPink") }}></div>
          <div className={`h-5 w-5 bg-[GreenYellow] rounded-lg cursor-pointer ${color == 'GreenYellow' ? 'outline outline-2 outline-slate-50' : ''}`} onClick={() => { setColor("GreenYellow") }}></div>
          <div className={`h-5 w-5 bg-[Magenta] rounded-lg cursor-pointer ${color == 'Magenta' ? 'outline outline-2 outline-slate-50' : ''}`} onClick={() => { setColor("Magenta") }}></div>
          <div className={`h-5 w-5 bg-[Black] rounded-lg cursor-pointer ${color == 'Black' ? 'outline outline-2 outline-slate-50' : ''}`} onClick={() => { setColor("Black") }}></div>
        </div>


        {color && <span className={`text-[${color}] font-semibold`}> {color} </span>}

        <div className="flex flex-col gap-4 w-[90%]">

          <button onClick={() => {
            setAnnotate({ ...defaultAnnotate, highlighter: !annotate.highlighter });

          }} className={`flex flex-row w-full p-1 rounded-lg items-center hover:outline hover:outline-2 hover:outline-slate-100 justify-start gap-2 ${annotate.highlighter ? 'bg-slate-700 outline outline-2 outline-slate-100 shadow-xl' : ''}`}>
            <MdFormatColorText size={20} /> Text highlighter
          </button>
          <button
            onClick={() => {
              setAnnotate({ ...defaultAnnotate, draw: !annotate.draw });
            }}
            className={`flex flex-row w-full p-1 rounded-lg items-center hover:outline hover:outline-2 hover:outline-slate-100 justify-start gap-2 ${annotate.draw ? 'bg-slate-700 outline outline-2 outline-slate-100 shadow-xl' : ''}`}>
            <LuPencilLine size={20} /> Pen
          </button>

          <button
            className={`flex flex-col w-full rounded-lg items-center hover:outline hover:outline-2 hover:outline-slate-100 justify-start gap-2 ${annotate.text ? 'bg-slate-700 outline outline-2 outline-slate-100 shadow-xl' : ''}`}>
            <div onClick={() => {
              setAnnotate({ ...defaultAnnotate, text: !annotate.text })
            }}
              className='flex flex-row w-full p-1 items-center justify-start gap-2'><CiText size={20} /> Text</div>

            {annotate.text &&
              <div className={`flex flex-col w-full p-1 items-center justify-center gap-2 transition-all duration-300`}>
                <div className='flex flex-row items-center justify-center gap-2'>
                  Font size
                  <input
                    type="text"
                    value={textOptions.size}
                    onChange={(e) => { setTextOptions({ ...textOptions, size: e.target.value }) }}
                    className='w-10 p-1 bg-slate-800 rounded-lg'
                    placeholder="16"
                  />
                </div>
                <div className='flex items-center ml-2 mr-2 justify-center gap-2'>
                  <select className='flex max-w-28 gap-1 p-1 text-center hover:cursor-pointer rounded-lg bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-transparent transition duration-200 ease-in-out'
                    value={textOptions.font} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setTextOptions({ ...textOptions, font: e.target.value }) }}>
                    <option value="Arial" className='font-arial'>Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                </div>

              </div>
            }
          </button>

          <button onClick={() => {
            setAnnotate({ ...defaultAnnotate, marker: !annotate.marker })
          }}
            className={`flex flex-row w-full p-1 rounded-lg items-center hover:outline hover:outline-2 hover:outline-slate-100 justify-start gap-2 ${annotate.marker ? 'bg-slate-700 outline outline-2 outline-slate-100 shadow-xl' : ''}`}>
            <PiHighlighterDuotone size={20} /> Marker
          </button>
          <button
            onClick={saveHandler}
            className='flex flex-row w-full p-1 rounded-lg items-center hover:outline hover:outline-2 hover:outline-slate-100 justify-start gap-2'>
            <LuSave size={20} />Save
          </button>

        </div>

      </div>
    </>
  )
}

export default App

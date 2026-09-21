export type TemplateValueType = {
    templateId: string;
    fieldId: string;
    authorId: string;
    content: string;
    date: string;
}

export type GetTemplateValueType = Omit<
    TemplateValueType, 
    "templateId"
>

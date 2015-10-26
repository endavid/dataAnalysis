function W=euclideanMatrix(w,h,cx,cy,k,s);
% W=euclideanMatrix(w,h);
%
% k: neighbor distance. If 0, computes all
% s: sigma of the gaussian
%
% Builds a matrix with the distances between coordinates (e^d)
% normalized by the size, to the center cx,cy
% (starting at 1, 1)
% 
% See: Keuclidean

if nargin<5
    k=0;
    s=1;
elseif nargin<6
    s=1;
end

W=zeros(h,w);

for i=1:w
    for j=1:h
        if (k==0) | ((abs(i-cx) < k) & (abs(j-cy)<k))
            W(j,i)=exp(-(((i-cx)*(i-cx)/(w*w)+(j-cy)*(j-cy)/(h*h)))/s);
            %W(j,i)=(i-cx)*(i-cx)+(j-cy)*(j-cy);            
        end
    end
end
%imshow(W)
%W=1-W/((w-1)*(w-1)+(h-1)*(h-1));